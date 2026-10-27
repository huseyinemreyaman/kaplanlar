package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"testing"
)

func TestAdminLoginProtectsStatisticsAndLogoutRevokesSession(t *testing.T) {
	router, err := newRouter("test-password-strong-enough", false)
	if err != nil {
		t.Fatal(err)
	}
	server := httptest.NewServer(router)
	defer server.Close()

	client := server.Client()
	client.Jar, err = cookiejar.New(nil)
	if err != nil {
		t.Fatal(err)
	}
	statsResponse, err := client.Get(server.URL + "/api/admin/stats")
	if err != nil {
		t.Fatal(err)
	}
	statsResponse.Body.Close()
	if statsResponse.StatusCode != http.StatusUnauthorized {
		t.Fatalf("unauthenticated stats status = %d, want %d", statsResponse.StatusCode, http.StatusUnauthorized)
	}

	wrongPasswordResponse := postJSON(t, client, server.URL+"/api/admin/login", `{"password":"wrong"}`)
	wrongPasswordResponse.Body.Close()
	if wrongPasswordResponse.StatusCode != http.StatusUnauthorized {
		t.Fatalf("wrong password status = %d, want %d", wrongPasswordResponse.StatusCode, http.StatusUnauthorized)
	}

	loginResponse := postJSON(t, client, server.URL+"/api/admin/login", `{"password":"test-password-strong-enough"}`)
	loginResponse.Body.Close()
	if loginResponse.StatusCode != http.StatusOK {
		t.Fatalf("login status = %d, want %d", loginResponse.StatusCode, http.StatusOK)
	}

	var sessionCookie *http.Cookie
	for _, cookie := range loginResponse.Cookies() {
		if cookie.Name == adminSessionCookie {
			sessionCookie = cookie
			break
		}
	}
	if sessionCookie == nil {
		t.Fatal("login did not set a session cookie")
	}
	if !sessionCookie.HttpOnly || sessionCookie.SameSite != http.SameSiteStrictMode || sessionCookie.Secure {
		t.Fatalf("unexpected session cookie settings: %+v", sessionCookie)
	}

	homepageResponse, err := client.Get(server.URL + "/")
	if err != nil {
		t.Fatal(err)
	}
	homepageResponse.Body.Close()

	statsResponse, err = client.Get(server.URL + "/api/admin/stats")
	if err != nil {
		t.Fatal(err)
	}
	defer statsResponse.Body.Close()
	if statsResponse.StatusCode != http.StatusOK {
		t.Fatalf("authenticated stats status = %d, want %d", statsResponse.StatusCode, http.StatusOK)
	}

	var statistics dashboardStatistics
	if err := json.NewDecoder(statsResponse.Body).Decode(&statistics); err != nil {
		t.Fatal(err)
	}
	if statistics.TotalPageViews != 1 || statistics.PageViews24Hours != 1 {
		t.Fatalf("page view counts = (%d, %d), want (1, 1)", statistics.TotalPageViews, statistics.PageViews24Hours)
	}
	if len(statistics.Pages) != 11 || statistics.Pages[0].Path != "/" || statistics.Pages[0].Views != 1 {
		t.Fatalf("unexpected page statistics: %+v", statistics.Pages)
	}

	logoutResponse := postJSON(t, client, server.URL+"/api/admin/logout", `{}`)
	logoutResponse.Body.Close()
	if logoutResponse.StatusCode != http.StatusOK {
		t.Fatalf("logout status = %d, want %d", logoutResponse.StatusCode, http.StatusOK)
	}

	statsResponse, err = client.Get(server.URL + "/api/admin/stats")
	if err != nil {
		t.Fatal(err)
	}
	statsResponse.Body.Close()
	if statsResponse.StatusCode != http.StatusUnauthorized {
		t.Fatalf("stats after logout status = %d, want %d", statsResponse.StatusCode, http.StatusUnauthorized)
	}
}

func TestAdminLoginRequiresConfiguredPasswordAndLimitsAttempts(t *testing.T) {
	router, err := newRouter("", false)
	if err != nil {
		t.Fatal(err)
	}
	server := httptest.NewServer(router)
	defer server.Close()

	response := postJSON(t, server.Client(), server.URL+"/api/admin/login", `{"password":"guess"}`)
	response.Body.Close()
	if response.StatusCode != http.StatusServiceUnavailable {
		t.Fatalf("unconfigured login status = %d, want %d", response.StatusCode, http.StatusServiceUnavailable)
	}

	router, err = newRouter("test-password-strong-enough", false)
	if err != nil {
		t.Fatal(err)
	}
	server = httptest.NewServer(router)
	defer server.Close()

	client := server.Client()
	for attempt := 0; attempt < loginAttemptLimit; attempt++ {
		response = postJSON(t, client, server.URL+"/api/admin/login", `{"password":"guess"}`)
		response.Body.Close()
		if response.StatusCode != http.StatusUnauthorized {
			t.Fatalf("failed login attempt %d status = %d, want %d", attempt+1, response.StatusCode, http.StatusUnauthorized)
		}
	}

	response = postJSON(t, client, server.URL+"/api/admin/login", `{"password":"guess"}`)
	response.Body.Close()
	if response.StatusCode != http.StatusTooManyRequests {
		t.Fatalf("rate-limited login status = %d, want %d", response.StatusCode, http.StatusTooManyRequests)
	}
}

func postJSON(t *testing.T, client *http.Client, url, body string) *http.Response {
	t.Helper()

	response, err := client.Post(url, "application/json", bytes.NewBufferString(body))
	if err != nil {
		t.Fatal(err)
	}
	return response
}
