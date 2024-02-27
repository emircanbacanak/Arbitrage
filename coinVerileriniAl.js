const ccxt = require('ccxt');
const { getBorsaİsimleri, coinSor, ALIM_KOMISYON_ORANI, SATIS_KOMISYON_ORANI, bekle } = require('./trade');

async function coinVerileriniAl() {
    const binance = new ccxt.binance();
    const kucoin = new ccxt.kucoin();
    const btcturk = new ccxt.btcturk();

    await Promise.all([binance.loadMarkets(), kucoin.loadMarkets(), btcturk.loadMarkets()]);

    const binanceSembolleri = binance.symbols.filter(symbol => symbol.endsWith('/USDT') && !symbol.startsWith('GAL/') && !symbol.includes('ENJ/'));
    const kucoinSembolleri = kucoin.symbols.filter(symbol => symbol.endsWith('/USDT') && !symbol.startsWith('GAL/') && !symbol.includes('ENJ/'));
    const btcturkSembolleri = btcturk.symbols.filter(symbol => symbol.endsWith('/USDT') && !symbol.startsWith('GAL/') && !symbol.includes('ENJ/'));

    const binanceTickerlari = await binance.fetchTickers(binanceSembolleri);
    const kucoinTickerlari = await kucoin.fetchTickers(kucoinSembolleri);

    let btcturkTickerlari = {};
    try {
        btcturkTickerlari = await btcturk.fetchTickers(btcturkSembolleri);
    } catch (error) {
        console.error("BTCTurk API'ye istek gönderilirken bir hata oluştu:", error);
    }

    const ortakSemboller = binanceSembolleri.filter(symbol => kucoinSembolleri.includes(symbol) && btcturkSembolleri.includes(symbol));

    let fiyatFarklari = [];
    for (const sembol of ortakSemboller) {
        const binanceFiyati = binanceTickerlari[sembol].last;
        const kucoinFiyati = kucoinTickerlari[sembol].last;
        const btcturkFiyati = btcturkTickerlari[sembol].last;

        const maxFiyat = Math.max(binanceFiyati, kucoinFiyati, btcturkFiyati);
        const minFiyat = Math.min(binanceFiyati, kucoinFiyati, btcturkFiyati);

        const fiyatFarki = maxFiyat - minFiyat;
        const yüzdeFarki = Math.abs(((maxFiyat / minFiyat) - 1) * 100);

        fiyatFarklari.push({ sembol, yüzdeFarki: yüzdeFarki, maxFiyat, minFiyat });
    }

    fiyatFarklari.sort((a, b) => a.yüzdeFarki - b.yüzdeFarki);

    console.log("Tüm Coin Çiftleri:");
    for (const { sembol, yüzdeFarki, maxFiyat, minFiyat } of fiyatFarklari) {
        const alimBorsasi = getBorsaİsimleri(minFiyat, binanceTickerlari[sembol].last, kucoinTickerlari[sembol].last, btcturkTickerlari[sembol].last);
        const satişBorsasi = getBorsaİsimleri(maxFiyat, binanceTickerlari[sembol].last, kucoinTickerlari[sembol].last, btcturkTickerlari[sembol].last);

        console.log(`Coin: ${sembol}`);
        console.log(`En Düşük Fiyat: ${minFiyat} - ${alimBorsasi}`);
        console.log(`En Yüksek Fiyat: ${maxFiyat} - ${satişBorsasi}`);
        console.log(`Yüzdelik Fark: +${yüzdeFarki.toFixed(2)}%`);
        console.log('------------------------');
    }

    let seçilenCoin = null;
    while (!seçilenCoin) {
        seçilenCoin = await coinSor();
        if (!fiyatFarklari.find(coin => coin.sembol === seçilenCoin)) {
            console.log("Geçersiz bir coin seçtiniz. Lütfen tekrar deneyin.");
            seçilenCoin = null;
        }
    }

    const seçilenCoinVerisi = fiyatFarklari.find(coin => coin.sembol === seçilenCoin);

    if (seçilenCoinVerisi) {
        const { sembol, yüzdeFarki, maxFiyat, minFiyat } = seçilenCoinVerisi;
        const alimBorsasi = getBorsaİsimleri(minFiyat, binanceTickerlari[sembol].last, kucoinTickerlari[sembol].last, btcturkTickerlari[sembol].last);
        const satişBorsasi = getBorsaİsimleri(maxFiyat, binanceTickerlari[sembol].last, kucoinTickerlari[sembol].last, btcturkTickerlari[sembol].last);
        const alimFiyati = minFiyat;
        const satişFiyati = maxFiyat;

        console.log(`Coin: ${sembol}`);
        console.log(`En Düşük Fiyat: ${alimFiyati} - ${alimBorsasi}`);
        console.log(`En Yüksek Fiyat: ${satişFiyati} - ${satişBorsasi}`);
        console.log(`Yüzdelik Fark: +${yüzdeFarki.toFixed(2)}%`);
        console.log('------------------------');

        const başlangiçBakiyesi = 100; // Başlangıç bakiyesi
        let bakiye = başlangiçBakiyesi;
        const alimMiktari = bakiye / alimFiyati; // Alınabilecek miktarı hesapla
        const alimKomisyonu = alimMiktari * ALIM_KOMISYON_ORANI; // Alım komisyonunu hesapla
        const toplamAlimTutari = alimMiktari - alimKomisyonu; // Toplam alım tutarını hesapla
        bakiye -= toplamAlimTutari * alimFiyati; // Yeni bakiyeyi güncelle

        console.log(`Alim Miktari: ${alimMiktari.toFixed(3)}`);
        console.log(`Alim Komisyonu: ${alimKomisyonu.toFixed(3)}`);
        console.log(`Toplam Alim Tutari: ${toplamAlimTutari.toFixed(3)}`);
        console.log(`Yeni Alim Bakiyesi: ${toplamAlimTutari * alimFiyati.toFixed(3)}`);
        console.log(Transfer, Ucreti, $, {});
        console.log('------------------------');

        const satişMiktari = toplamAlimTutari; // Satılacak miktarı alım miktarına eşitle
        const satişKomisyonu = satişMiktari * SATIS_KOMISYON_ORANI; // Satış komisyonunu hesapla
        const satişTutari = satişMiktari - satişKomisyonu; // Toplam satış tutarını hesapla
        console.log(`Satiş Miktari: ${satişMiktari.toFixed(3)}`);
        console.log(`Satiş Komisyonu: ${satişKomisyonu.toFixed(3)}`);
        console.log(`Toplam Satiş Tutari: ${satişTutari.toFixed(3)}`);
        console.log('------------------------');
        bakiye += satişTutari * satişFiyati; // Yeni bakiyeyi güncelle
        console.log(`Son Bakiye: ${bakiye.toFixed(2)}`);
    } else {
        console.log("Geçersiz bir coin seçtiniz.");
    }

    await bekle(2000); // 2 saniye bekle
    coinVerileriniAl(); // Tekrar baştan çalıştır
}
exports.coinVerileriniAl = coinVerileriniAl;
