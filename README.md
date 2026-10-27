# BKM Kaplanlar

BKM Kaplanlar için robotik, bilim ve kodlama odaklı çok sayfalı öğrenci takımı sitesi. Go/Gin statik sayfaları ve küçük JSON sağlık kontrolünü sunar; arayüz HTML, CSS ve bağımlılıksız JavaScript kullanır.

## Sayfalar

- `/` — Takım tanıtımı ve proje alanlarına kısa bakış
- `/projects` — TÜBİTAK, TEKNOFEST, LEGO SPIKE, LEGO VEX ve Kodlama alanları; arama, kategori filtresi ve kaydedilen projeler
- `/projects/tubitak`, `/projects/teknofest`, `/projects/lego-spike`, `/projects/lego-vex`, `/projects/kodlama` — Her proje alanı için ayrı ayrıntı sayfası
- `/members` — Örnek isim ve fotoğraflar; arama ve rol filtreleri
- `/events` — Etkinlik planlayıcısı; etkinlik ekleme/silme ve `.ics` takvim indirme
- `/support` — Mentorluk, malzeme ve paylaşım desteği; SSS
- `/contact` — İletişim formu, otomatik taslak kaydı ve form doğrulaması
- `/admin` — `ADMIN_PASSWORD` ile korunan yönetim paneli; toplam ve son 24 saatlik sayfa görüntülemeleri, sayfa dağılımı ve sunucu çalışma süresi

`/support` sayfası ortak site dosyalarına ek olarak kendi `support.css` ve `support.js` dosyalarını kullanır. SSS alanında tüm soruları birlikte açıp kapatma kontrolü bulunur. Proje ayrıntıları ortak `project-detail.css` stil dosyasını kullanır.

Tüm sayfalarda koyu tema varsayılandır; tema tercihi tarayıcıda hatırlanır. Tema, favoriler, iletişim taslağı ve planlanan etkinlikler `localStorage` ile yalnızca kullanılan tarayıcıda saklanır. Etkinlikler cihazlar arasında otomatik senkronize edilmez.

Yönetici paneli parolası `ADMIN_PASSWORD` ortam değişkeninden okunur. Değişken tanımlı değilse giriş kapalı kalır. Yerel HTTP geliştirmesinde `ADMIN_COOKIE_SECURE=false` ayarlayın; canlı ortamda HTTPS kullanın ve bu ayarı tanımlamayın. Panel, parola korumalı, rastgele üretilen ve HTTP-only oturum çerezi kullanır. Giriş denemeleri istemci başına sınırlandırılır. Ziyaret istatistikleri yalnızca uygulama belleğinde toplu olarak tutulur; IP veya ziyaretçi kimliği kaydedilmez ve sunucu yeniden başlayınca sıfırlanır.

Ekip isimleri ve fotoğraflar tasarım örneğidir; yayına almadan önce gerçek içeriklerle değiştirin. İletişim formunun mesaj gönderimi henüz etkin değildir. Destek sayfasında ödeme veya bağış altyapısı bulunmaz.

## Yerel geliştirme

```bash
cd backend
export ADMIN_PASSWORD='yerel-geliştirme-icin-guclu-bir-parola'
export ADMIN_COOKIE_SECURE=false
go run .
```

Siteyi `http://localhost:3000` adresinde açın. Yönetim paneli `http://localhost:3000/admin` adresindedir. `GET /api/health` sunucu durumunu JSON olarak döndürür.

## Teknoloji

- Go ve Gin ile statik sayfa sunumu, parola korumalı yönetici API'si ve sağlık kontrolü
- HTML, CSS ve bağımlılıksız JavaScript
- DM Sans ve Manrope yazı tipleri
- Duyarlı navigasyon, koyu/açık tema, proje ve ekip filtreleri, yerel favoriler, takvim dosyası oluşturma, iletişim taslağı, SSS akordiyonu, ana sayfada hafif giriş animasyonları ve azaltılmış hareket tercihi desteği
