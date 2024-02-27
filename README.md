
# Arbitraj Programı README
Bu Node.js tabanlı arbitraj programı, Binance ve BTCTurk borsaları arasındaki fiyat farklarını izleyerek kar elde etmeyi hedefler. Program, her iki borsadan coin çiftlerinin anlık fiyatlarını alarak, aralarındaki farkları kontrol eder ve karlı işlem fırsatlarını tespit eder.
## Özellikler

- Henüz geliştirme aşamasındadır
- İki veya daha fazla kripto varlıkları takip eder
- Fiyat farkı en yüksek olan kripto varlıkları bulur
- Otomatik şekilde gerçekleşir
- Karlı işlem olursa bunu log halinde kayıt eder
 

  
## Yükleme 
```bash 
git clone https://github.com/emircanbacanak/Arbitrage.git
```
Bu GitHub deposunu klonlayarak veya ZIP olarak indirerek
çıkarın veya klonlayın.

Terminal veya Komut İstemi üzerinden proje dizinine gidin:
```bash 
cd Arbitrage-main
```
Proje dosyasının içindeyken, gerekli paketleri yüklemek için şu komutu çalıştırın: 
```bash 
  npm install
```
    
## Kullanım
Terminal veya Komut İstemi üzerinden proje dizininde olduğunuzdan emin olun.

Programı başlatmak için aşağıdaki komutu çalıştırın:
```bash 
node trade.js
```
Program, Binance ve BTCTurk borsalarındaki coin çiftlerini karşılaştıracak ve en yüksek farkı bulacaktır.

Eğer farkı olan bir coin bulunursa, işlem detayları ve potansiyel karlar aşağıdaki gibi ekrana yazdırılacaktır:
```bash 
Coin: BTC/USDT
Lowest Price: 40000 - BTCTurk
Highest Price: 40500 - Binance
Percentage Difference: +1.25%
------------------------
```
İşlem sonrası program tekrar farklılıkları kontrol edecek ve karlı işlemleri otomatik olarak gerçekleştirecektir.

## Önemli Noktalar
- 'trade.js' dosyasını düzenleyerek bakiye, başlangıç bakiyesi, komisyon oranları gibi değerleri ayarlayabilirsiniz.
```bash 
let baslangicBakiyesi = 75;
const ALIM_SATIM_KOMISYON_ORANI_BTCTURK = 0.00226;
const SATIS_SATIM_KOMISYON_ORANI_BINANCE = 0.001;
const CEKMEUCRETI = {
  "BTC/USDT": 0.01,
  "ETH/USDT": 0.008,
  // Diğer coinler...
};
```
- Program, CEKMEUCRETI objesinde belirtilen coin çiftlerindeki çekme ücretlerini de göz önünde bulundurarak işlem yapacaktır.

- Karlı işlemler log.txt dosyasına otomatik olarak kaydedilecektir.

## Gereksinimler
- Node.js (v14 veya daha yeni bir sürümü)
- ccxt kütüphanesi (bu paket package.json dosyasında yer almakta ve npm install ile yüklenecektir)

## İletişim
Eğer bir sorunuz veya öneriniz varsa, benimle şu adresten iletişime geçebilirsiniz: canemircan973@gmail.com