# Firefox Tab Backup Extension.

Bu Firefox eklentisi, açık olan sekmeleri otomatik olarak düzenli aralıklarla yedekler ve kazara kaybedilen sekmeleri geri yüklemenizi sağlar.

## Özellikler

- **Otomatik Yedekleme**: Tüm açık sekmeleri 5 dakika - 1 saat arasında ayarlanabilir aralıklarla yedekler
- **Manuel Yedekleme**: "Şimdi Yedekle" butonu ile anlık yedekleme yapabilirsiniz
- **Kolay Geri Yükleme**: En son yedeklenen sekmeleri tek tıkla geri yükleyebilirsiniz
- **Yedekleme Geçmişi**: Son 10 yedekleme arasından seçim yaparak geri yükleme yapabilirsiniz
- **Türkçe Arayüz**: Türkçe ve İngilizce dil desteği
- **Yerel Depolama**: Tüm veriler tarayıcınızda güvenli şekilde saklanır
- **Dışa Aktarım**  Butona tıklıyarak sekmeleri dışa aktarabilirsiniz json dosyası olarak
- **içe Aktarma**  Butona  tıklıyarak json dosyasını yüklüyebilirsiniz
- **ayarlar** Panel Renk seçenegi mevcut, dark mode mevcut , Tarih formatı, Mevcut ve  Kısayollar mevcut.



## Kurulum

### 1. Dosyaları Hazırlayın

Şu dosya yapısını oluşturun:

```
tab-backup-extension/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── _locales/
│   ├── en/
│   │   └── messages.json
│   └── tr/
│       └── messages.json
└── icons/ (opsiyonel)
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-48.png
    └── icon-128.png
```

### 2. Firefox'ta Yükleme

1. Firefox'u açın
2. Adres çubuğuna `about:debugging` yazın
3. Sol menüden "This Firefox" seçin
4. "Load Temporary Add-on" butonuna tıklayın
5. `manifest.json` dosyasını seçin

### 3. Kalıcı Kurulum İçin
eklentimiz mozilla eklentilerinde  bulabilirsiniz





## Kullanım

### Popup Arayüzü

- **Şimdi Yedekle**: Mevcut tüm sekmeleri anında yedekler
- **Son Yedeği Geri Yükle**: En son yedeklenen sekmeleri geri yükler
- **Otomatik Yedekleme**: Otomatik yedeklemeyi açar/kapatır
- **Yedekleme Aralığı**: 5 dakika ile 1 saat arasında ayarlanabilir
- **Dışa Aktarım**  Butona tıklıyarak sekmeleri dışa aktarabilirsiniz json dosyası olarak
- **içe Aktarma**  Butona  tıklıyarak json dosyasını yüklüyebilirsiniz
- **ayarlar** Panel Renk seçenegi mevcut, dark mode mevcut , Tarih formatı, Mevcut ve  Kısayollar mevcut.
 **Yedekleme Geçmişi**  Son 10 yedekleme arasından seçim yaparak geri yükleme yapabilirsiniz

- Son 10 yedekleme listelenir
- Her yedekleme için tarih, saat, pencere ve sekme sayısı gösterilir
- Herhangi bir yedeklemeyi seçerek geri yükleme yapabilirsiniz

## Teknik Detaylar

### Yedeklenen Veriler

-
