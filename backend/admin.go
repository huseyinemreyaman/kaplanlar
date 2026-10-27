package main

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"net"
	"net/http"
	"sort"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	adminSessionCookie = "bkm_admin_session"
	adminSessionTTL    = 8 * time.Hour
	loginWindow        = 15 * time.Minute
	loginAttemptLimit  = 8
	maxLoginClients    = 4096
)

type adminAuth struct {
	password      string
	secureCookie  bool
	mu            sync.Mutex
	sessions      map[[32]byte]time.Time
	loginMu       sync.Mutex
	loginAttempts map[[32]byte][]time.Time
}

func newAdminAuth(password string, secureCookie bool) *adminAuth {
	return &adminAuth{
		password:      password,
		secureCookie:  secureCookie,
		sessions:      make(map[[32]byte]time.Time),
		loginAttempts: make(map[[32]byte][]time.Time),
	}
}

func (auth *adminAuth) loginHandler(c *gin.Context) {
	setAdminResponseHeaders(c)
	if auth.password == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Yönetici girişi sunucuda yapılandırılmamış."})
		return
	}

	now := time.Now()
	clientKey := remoteAddressKey(c.Request.RemoteAddr)
	if auth.loginBlocked(clientKey, now) {
		c.Header("Retry-After", strconv.Itoa(int(loginWindow.Seconds())))
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Çok fazla hatalı deneme yapıldı. Lütfen daha sonra tekrar dene."})
		return
	}

	var request struct {
		Password string `json:"password"`
	}
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 1024)
	decoder := json.NewDecoder(c.Request.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&request); err != nil {
		var maxBytesError *http.MaxBytesError
		if errors.As(err, &maxBytesError) {
			c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "İstek çok büyük."})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Giriş isteği okunamadı."})
		return
	}
	if err := decoder.Decode(&struct{}{}); err != nil {
		if !errors.Is(err, io.EOF) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Giriş isteği geçersiz."})
			return
		}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Giriş isteği geçersiz."})
		return
	}

	providedPasswordHash := sha256.Sum256([]byte(request.Password))
	expectedPasswordHash := sha256.Sum256([]byte(auth.password))
	if subtle.ConstantTimeCompare(providedPasswordHash[:], expectedPasswordHash[:]) != 1 {
		auth.recordLoginFailure(clientKey, now)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Parola hatalı."})
		return
	}

	auth.clearLoginFailures(clientKey)
	randomToken := make([]byte, 32)
	if _, err := rand.Read(randomToken); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Güvenli oturum başlatılamadı."})
		return
	}
	token := base64.RawURLEncoding.EncodeToString(randomToken)
	tokenHash := sha256.Sum256([]byte(token))

	auth.mu.Lock()
	auth.removeExpiredSessionsLocked(now)
	auth.sessions[tokenHash] = now.Add(adminSessionTTL)
	auth.mu.Unlock()

	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(
		adminSessionCookie,
		token,
		int(adminSessionTTL.Seconds()),
		"/api/admin",
		"",
		auth.secureCookie,
		true,
	)
	c.JSON(http.StatusOK, gin.H{"authenticated": true})
}

func (auth *adminAuth) logoutHandler(c *gin.Context) {
	setAdminResponseHeaders(c)
	if cookie, err := c.Request.Cookie(adminSessionCookie); err == nil {
		tokenHash := sha256.Sum256([]byte(cookie.Value))
		auth.mu.Lock()
		delete(auth.sessions, tokenHash)
		auth.mu.Unlock()
	}

	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(adminSessionCookie, "", -1, "/api/admin", "", auth.secureCookie, true)
	c.JSON(http.StatusOK, gin.H{"authenticated": false})
}

func (auth *adminAuth) requireSession(handler gin.HandlerFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		setAdminResponseHeaders(c)

		cookie, err := c.Request.Cookie(adminSessionCookie)
		if err != nil || !auth.hasValidSession(cookie.Value, time.Now()) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Yönetici oturumu gerekli."})
			return
		}

		handler(c)
	}
}

func setAdminResponseHeaders(c *gin.Context) {
	c.Header("Cache-Control", "no-store")
	c.Header("X-Content-Type-Options", "nosniff")
}

func (auth *adminAuth) hasValidSession(token string, now time.Time) bool {
	tokenHash := sha256.Sum256([]byte(token))
	auth.mu.Lock()
	defer auth.mu.Unlock()

	auth.removeExpiredSessionsLocked(now)
	expiresAt, exists := auth.sessions[tokenHash]
	return exists && now.Before(expiresAt)
}

func (auth *adminAuth) removeExpiredSessionsLocked(now time.Time) {
	for tokenHash, expiresAt := range auth.sessions {
		if !now.Before(expiresAt) {
			delete(auth.sessions, tokenHash)
		}
	}
}

func remoteAddressKey(remoteAddress string) [32]byte {
	host, _, err := net.SplitHostPort(remoteAddress)
	if err == nil {
		remoteAddress = host
	}
	return sha256.Sum256([]byte(remoteAddress))
}

func (auth *adminAuth) loginBlocked(clientKey [32]byte, now time.Time) bool {
	auth.loginMu.Lock()
	defer auth.loginMu.Unlock()

	auth.pruneLoginFailuresLocked(now)
	attempts := auth.loginAttempts[clientKey]
	if _, knownClient := auth.loginAttempts[clientKey]; !knownClient && len(auth.loginAttempts) >= maxLoginClients {
		return true
	}
	return len(attempts) >= loginAttemptLimit
}

func (auth *adminAuth) recordLoginFailure(clientKey [32]byte, now time.Time) {
	auth.loginMu.Lock()
	defer auth.loginMu.Unlock()

	auth.pruneLoginFailuresLocked(now)
	if len(auth.loginAttempts) >= maxLoginClients {
		if _, exists := auth.loginAttempts[clientKey]; !exists {
			return
		}
	}
	auth.loginAttempts[clientKey] = append(auth.loginAttempts[clientKey], now)
}

func (auth *adminAuth) clearLoginFailures(clientKey [32]byte) {
	auth.loginMu.Lock()
	delete(auth.loginAttempts, clientKey)
	auth.loginMu.Unlock()
}

func (auth *adminAuth) pruneLoginFailuresLocked(now time.Time) {
	cutoff := now.Add(-loginWindow)
	for clientKey, attempts := range auth.loginAttempts {
		remaining := attempts[:0]
		for _, attempt := range attempts {
			if attempt.After(cutoff) {
				remaining = append(remaining, attempt)
			}
		}
		if len(remaining) == 0 {
			delete(auth.loginAttempts, clientKey)
		} else {
			auth.loginAttempts[clientKey] = remaining
		}
	}
}

type pageVisitBucket struct {
	minute int64
	counts map[string]uint64
}

type pageStatistic struct {
	Path  string `json:"path"`
	Views uint64 `json:"views"`
}

type dashboardStatistics struct {
	GeneratedAt      time.Time       `json:"generatedAt"`
	UptimeSeconds    int64           `json:"uptimeSeconds"`
	TotalPageViews   uint64          `json:"totalPageViews"`
	PageViews24Hours uint64          `json:"pageViews24Hours"`
	Pages            []pageStatistic `json:"pages"`
}

type pageAnalytics struct {
	startedAt time.Time
	mu        sync.Mutex
	total     uint64
	totals    map[string]uint64
	buckets   [24 * 60]pageVisitBucket
}

func newPageAnalytics(now time.Time) *pageAnalytics {
	return &pageAnalytics{
		startedAt: now,
		totals:    make(map[string]uint64),
	}
}

func (analytics *pageAnalytics) middleware(trackedPages map[string]struct{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if c.Request.Method != http.MethodGet || c.Writer.Status() != http.StatusOK {
			return
		}
		if _, tracked := trackedPages[c.Request.URL.Path]; !tracked {
			return
		}

		analytics.record(c.Request.URL.Path, time.Now())
	}
}

func (analytics *pageAnalytics) record(path string, now time.Time) {
	minute := now.Unix() / 60
	bucketIndex := minute % int64(len(analytics.buckets))

	analytics.mu.Lock()
	defer analytics.mu.Unlock()

	bucket := &analytics.buckets[bucketIndex]
	if bucket.minute != minute {
		bucket.minute = minute
		bucket.counts = make(map[string]uint64)
	}
	bucket.counts[path]++
	analytics.totals[path]++
	analytics.total++
}

func (analytics *pageAnalytics) statistics(now time.Time) dashboardStatistics {
	minuteNow := now.Unix() / 60
	firstMinute := now.Add(-24*time.Hour).Unix() / 60

	analytics.mu.Lock()
	defer analytics.mu.Unlock()

	statistics := dashboardStatistics{
		GeneratedAt:    now,
		UptimeSeconds:  int64(now.Sub(analytics.startedAt).Seconds()),
		TotalPageViews: analytics.total,
		Pages:          make([]pageStatistic, 0, len(analytics.totals)),
	}

	for path, views := range analytics.totals {
		statistics.Pages = append(statistics.Pages, pageStatistic{
			Path:  path,
			Views: views,
		})
	}
	for _, bucket := range analytics.buckets {
		if bucket.counts == nil || bucket.minute < firstMinute || bucket.minute > minuteNow {
			continue
		}
		for _, views := range bucket.counts {
			statistics.PageViews24Hours += views
		}
	}

	sort.Slice(statistics.Pages, func(i, j int) bool {
		if statistics.Pages[i].Views == statistics.Pages[j].Views {
			return statistics.Pages[i].Path < statistics.Pages[j].Path
		}
		return statistics.Pages[i].Views > statistics.Pages[j].Views
	})
	return statistics
}
