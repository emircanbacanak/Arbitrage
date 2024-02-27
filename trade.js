const fs = require('fs');
const ccxt = require('ccxt')
let kar;
const ALIM_SATIM_KOMISYON_ORANI_BTCTURK = 0.00226;
const SATIS_SATIM_KOMISYON_ORANI_BINANCE = 0.001;
const CEKMEUCRETI = {
  "XTZ/USDT": 0.01,
  "ETC/USDT": 0.008,
  "FLOW/USDT": 0.008,
  "SOL/USDT": 0.008,
  "DOT/USDT": 0.08,
  "ALGO/USDT": 0.008,
  "EOS/USDT": 0.08,
  "AVAX/USDT": 0.008,
  "BAR/USDT": 0,
  "ACM/USDT": 0,
  "NEO/USDT": 0,
  "DASH/USDT": 0.0016,
  "LUNC/USDT": 0.01,
  "APT/USDT": 0.01,
  "FIL/USDT": 0.001,
  "XLM/USDT": 0.02,
  "DOGE/USDT": 4,
  "XRP/USDT": 0.2,
  "TRX/USDT": 1,
  "ETH/USDT": 0.0002
};
const GERICEKME_UCRETI = 0.5;
let bakiye = 0;
let baslangicBakiyesi = 75;
let binanceTickerlari, btcturkTickerlari;

async function getCoinData() {
  bakiye = baslangicBakiyesi;
  const binance = new ccxt.binance();
  const btcturk = new ccxt.btcturk();
  await Promise.all([binance.loadMarkets(), btcturk.loadMarkets()]);
  const binanceSymbols = binance.symbols.filter(
    (symbol) => symbol.endsWith('/USDT') && !symbol.startsWith('GAL/') && !symbol.includes('ENJ/')&& !symbol.includes('JUV/')
  );
  const btcturkSymbols = btcturk.symbols.filter(
    (symbol) => symbol.endsWith('/USDT') && !symbol.startsWith('GAL/') && !symbol.includes('ENJ/')&& !symbol.includes('JUV/')
  );
  binanceTickerlari = await binance.fetchTickers(binanceSymbols);
  try {
    btcturkTickerlari = await btcturk.fetchTickers(btcturkSymbols);
  } catch (error) {
    console.error("BTCTurk API'ye istek gönderilirken bir hata oluştu:", error.message);
  }
  const commonSymbols = binanceSymbols.filter((symbol) => btcturkSymbols.includes(symbol));
  const priceDifferences = [];
  commonSymbols.forEach((symbol) => {
    const binancePrice = binanceTickerlari[symbol].last;
    const btcturkPrice = btcturkTickerlari[symbol].last;
    const maxPrice = Math.max(binancePrice, btcturkPrice);
    const minPrice = Math.min(binancePrice, btcturkPrice);
    const priceDifference = maxPrice - minPrice;
    const percentageDifference = Math.abs(((maxPrice / minPrice) - 1) * 100);
    const lowestExchange = getExchangeName(minPrice, binancePrice, btcturkPrice);
    const highestExchange = getExchangeName(maxPrice, binancePrice, btcturkPrice);
    priceDifferences.push({
      symbol,
      percentageDifference,
      maxPrice,
      minPrice,
      lowestExchange,
      highestExchange
    });
  });
  priceDifferences.sort((a, b) => b.percentageDifference - a.percentageDifference);
  console.log("All Coin Pairs:");
  priceDifferences.forEach(({ symbol, percentageDifference, maxPrice, minPrice, lowestExchange, highestExchange }) => {
    console.log(`Coin: ${symbol}`);
    console.log(`Lowest Price: ${minPrice} - ${lowestExchange}`);
    console.log(`Highest Price: ${maxPrice} - ${highestExchange}`);
    console.log(`Percentage Difference: +${percentageDifference.toFixed(2)}%`);
    console.log('------------------------');
  });
  let selectedCoin = null;
  for (const coin of priceDifferences) {
    if (CEKMEUCRETI.hasOwnProperty(coin.symbol)) {
      selectedCoin = coin;
      break;
    }
  }
  if (selectedCoin) {
    console.log("Selected Coin:");
    console.log(`Coin: ${selectedCoin.symbol}`);
    console.log(`Lowest Price: ${selectedCoin.minPrice} - ${selectedCoin.lowestExchange}`);
    console.log(`Highest Price: ${selectedCoin.maxPrice} - ${selectedCoin.highestExchange}`);
    console.log(`Percentage Difference: +${selectedCoin.percentageDifference.toFixed(2)}%`);
    console.log('------------------------');
    await buySell(selectedCoin);
    
  } else {
    console.log("No coin found in the withdrawal fees array.");
  }
}

async function buySell(coinData) {
  const { symbol, percentageDifference, maxPrice, minPrice, lowestExchange, highestExchange } = coinData;
  const buyPrice = minPrice;
  const sellPrice = maxPrice;
  console.log(`Coin: ${symbol}`);
  console.log(`Lowest Price: ${buyPrice} - ${lowestExchange}`);
  console.log(`Highest Price: ${sellPrice} - ${highestExchange}`);
  console.log(`Percentage Difference: +${percentageDifference.toFixed(2)}%`);
  console.log('------------------------');
  console.log(`bakiye: ${bakiye.toFixed(4)}`);
  const buyAmount = bakiye / buyPrice;
  console.log(`Buy Amount: ${buyAmount.toFixed(4)}`);
  let buyCommission = 0;
  let sellAmount = 0;
  let sellCommission = 0;
  if (highestExchange === "Binance") {
    sellCommission = sellAmount * SATIS_SATIM_KOMISYON_ORANI_BINANCE;
  } else {
    sellCommission = sellAmount * ALIM_SATIM_KOMISYON_ORANI_BTCTURK;
  }
  if (lowestExchange === "BTCTurk") {
    buyCommission = buyAmount * ALIM_SATIM_KOMISYON_ORANI_BTCTURK;
  } else {
    buyCommission = buyAmount * SATIS_SATIM_KOMISYON_ORANI_BINANCE;
  }const totalBuyCost = buyAmount - buyCommission;
  console.log(`Buy Commission: ${buyCommission.toFixed(5)}`);
  
  console.log(`Total Buy Cost: ${totalBuyCost.toFixed(4)}`);
  bakiye -= totalBuyCost * buyPrice;
  console.log("Transfer Fee: ", CEKMEUCRETI[symbol]);
  if (CEKMEUCRETI.hasOwnProperty(symbol)) {
    console.log(`New Buy Balance: ${(totalBuyCost * buyPrice) - CEKMEUCRETI[symbol].toFixed(3)}`);
  } else {
    console.log(`CEKMEUCRETI value not found for ${symbol}.`);
  }
  
  console.log('------------------------');
  sellAmount = totalBuyCost - CEKMEUCRETI[symbol];
  sellCommission = sellAmount * SATIS_SATIM_KOMISYON_ORANI_BINANCE;
  const sellTotal = sellAmount - sellCommission;
  console.log(`Sell Amount: ${sellAmount.toFixed(3)}`);
  console.log(`Sell Commission: ${sellCommission.toFixed(3)}`);
  console.log(`Total Sell Amount: ${sellTotal.toFixed(3)}`);
  console.log(`Initial Return to Account fee: ${GERICEKME_UCRETI.toFixed(2)}`);
  console.log('------------------------');
  bakiye += sellTotal * sellPrice;
  console.log(`Our Balance on the Selling Exchange: ${bakiye}`);
  bakiye -= 0.5;
  console.log(`Our Balance in USDT: ${bakiye}`);

  
  const oldBalance = bakiye;
  if (oldBalance > baslangicBakiyesi) {
    console.log("Since the balance is greater than the initial balance, the process is repeated...");
    kar = oldBalance - baslangicBakiyesi;
    console.log("karımız:", kar)
    bakiye = 75;
    baslangicBakiyesi = bakiye;
    logProfitableTrade(coinData, bakiye.toFixed(4));
    await wait(1000);
    getCoinData();
  } else {
    bakiye = baslangicBakiyesi;
    console.log("Not in a profitable state, so repeating.");
    await wait(2000);
    getCoinData();
  }
  
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getExchangeName(price, binancePrice, btcturkPrice) {
  if (price === binancePrice) {
    return "Binance";
  } else if (price === btcturkPrice) {
    return "BTCTurk";
  } else {
    return "Unknown";
  }
}
const kar2=kar;
async function logProfitableTrade(coinData, balance) {
  const { symbol, percentageDifference } = coinData;
  const date = new Date();
  const time = `${date.getHours()}:${date.getMinutes().toFixed(0)}`;
  const logInfo = `
    Coin: ${symbol}
    Percentage Difference: +${percentageDifference.toFixed(2)}%
    Our Balance in USDT: ${balance}
    Log Time: ${time}
    Kar:${kar}`;
    
  
  fs.appendFileSync('log.txt', `${logInfo}\n\n------------------------\n`);
}

getCoinData().catch((error) => console.error(error));