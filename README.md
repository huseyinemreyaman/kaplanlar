# BKM Tigers

BKM Tigers için robotik, bilim ve kodlama odaklı çok sayfalı öğrenci takımı sitesi. Go/Gin statik sayfaları ve küçük JSON sağlık kontrolünü sunar; arayüz HTML, CSS ve bağımlılıksız JavaScript kullanır.

## Sayfalar

- `/` — Takım tanıtımı ve proje alanlarına kısa bakış
- `/projects` — TÜBİTAK, TEKNOFEST, LEGO SPIKE, LEGO VEX ve Kodlama alanları; arama, kategori filtresi ve kaydedilen projeler
- `/projects/tubitak`, `/projects/teknofest`, `/projects/lego-spike`, `/projects/lego-vex`, `/projects/kodlama` — Her proje alanı için ayrı ayrıntı sayfası
- `/members` — Örnek isim ve fotoğraflar; arama ve rol filtreleri
- `/events` — Etkinlik planlayıcısı; etkinlik ekleme/silme ve `.ics` takvim indirme
- `/support` — Mentorluk, malzeme ve paylaşım desteği; SSS
- `/contact` — İletişim formu, otomatik taslak kaydı ve form doğrulaması

`/support` sayfası ortak site dosyalarına ek olarak kendi `support.css` ve `support.js` dosyalarını kullanır. SSS alanında tüm soruları birlikte açıp kapatma kontrolü bulunur. Proje ayrıntıları ortak `project-detail.css` stil dosyasını kullanır.

Tüm sayfalarda koyu tema varsayılandır; tema tercihi tarayıcıda hatırlanır. Tema, favoriler, iletişim taslağı ve planlanan etkinlikler `localStorage` ile yalnızca kullanılan tarayıcıda saklanır. Etkinlikler cihazlar arasında otomatik senkronize edilmez.

Ekip isimleri ve fotoğraflar tasarım örneğidir; yayına almadan önce gerçek içeriklerle değiştirin. İletişim formunun mesaj gönderimi henüz etkin değildir. Destek sayfasında ödeme veya bağış altyapısı bulunmaz.

## Yerel geliştirme

```bash
cd backend
go run .
```

Siteyi `http://localhost:3000` adresinde açın. `GET /api/health` sunucu durumunu JSON olarak döndürür.

## Teknoloji

- Go ve Gin ile statik sayfa sunumu ve sağlık kontrolü
- HTML, CSS ve bağımlılıksız JavaScript
- DM Sans ve Manrope yazı tipleri
- Duyarlı navigasyon, koyu/açık tema, proje ve ekip filtreleri, yerel favoriler, takvim dosyası oluşturma, iletişim taslağı, SSS akordiyonu ve azaltılmış hareket tercihi desteği
