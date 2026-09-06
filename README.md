# KontrolSende

Gençlerin günlük alışkanlıkları üzerine düşünmesini amaçlayan bir bağımlılık farkındalığı okul projesi.

Bu depo, HTML/CSS/JavaScript arayüzünü ve ayrı bir API'ye bağlanan etkinlik/sonuç akışını içerir.

## İşlevler

- Ana sayfa ve proje tanıtımı.
- Kategori bazlı farkındalık testi ve yüzdelik sonuç grafikleri.
- API üzerinden yüklenen etkinlikler; görsel ve video gösterimi.
- Yardım ve destek kaynakları sayfası.
- Etkinlik ve test sonuçları için yönetim arayüzü.

Test puanları uygulamadaki soru ve puanlama mantığından üretilir. Klinik risk ölçümü veya tanı olarak kullanılmamalıdır.

## Veri akışı

Testin puanlanması tarayıcıda yapılır. Tamamlanan testin toplam yüzdesi ve kategori özetleri, yapılandırılmış API'ye gönderilir. Etkinlik listeleri ve yönetim işlemleri de aynı API'yi kullanır.

Bu nedenle uygulama, yalnız cihaz içinde sonuç saklayan çevrimdışı bir araç olarak değerlendirilmemelidir. Ayrı API'nin sunucu kodu bu depoda yer almaz.

## Dosya yapısı

| Yol | İçerik |
| --- | --- |
| `index.html` | Ana sayfa |
| `test.html` | Test arayüzü |
| `etkinlikler.html` | Etkinlik listesi |
| `yardim.html` | Yardım kaynakları |
| `admin.html` | Yönetim ekranı |
| `js/main.js` | Test, etkinlik ve API etkileşimleri |
| `css/style.css` | Görünüm |

## Yerel kullanım

Depo kökünde:

```bash
python3 -m http.server 8000
```

[localhost:8000](http://localhost:8000) adresini açın. Node.js bağımlılığı veya derleme adımı yoktur.

Sayfalarda kullanılan `window.API_BASE` ayarını kendi geliştirme API'nizle eşleştirin. Arayüzün açılması, ayrı API'nin çalıştığını veya yönetim yetkisinin doğrulandığını göstermez. Yönetim yetkilendirmesi API tarafında uygulanmalıdır; yayın yapılandırmasına erişim bilgisi eklemeyin.

## Yayınlama

GitHub Pages için depo kökünü yayın kaynağı olarak seçebilirsiniz. Aynı dosyalar başka bir statik sunucuda da çalışır.

API'nin arayüz origin'ini kabul etmesi ve HTTPS üzerinden ulaşılabilir olması gerekir. Test sonuçlarının gönderildiği veri akışını, kullanılacağı ortamın bilgilendirme ve veri saklama politikasıyla birlikte değerlendirin.

## Kontroller

Depoda otomatik test paketi bulunmaz. Geliştirme verisiyle şunları kontrol edin:

- Test boyunca ileri/geri gezinme ve yeniden başlatma.
- Kategori ve toplam sonuç gösterimi.
- Etkinliklerin yüklenmesi, görsel ve video bağlantıları.
- API erişimi olmadığında arayüz davranışı.
- Yetkili geliştirme hesabıyla yönetim akışı.

## Lisans

Kod [MIT lisansı](LICENSE) altındadır. Medya dosyalarının yeniden kullanım şartları ayrıca değerlendirilmelidir.
