const crypto = require('crypto');
const fetch = require('node-fetch');
const url = require('url');

const API_KEY = "6Fry5DTfT7C7BwFziWz0GuTSOALbOEulRyWO5yg1wIrqHI0mB3isZJcn7xW17BQx";
const API_SECRET = "EnYwrhj19usRZ5JVWqyhU0GvTWgGKQNFWbgCtvx7yTiipcu9J3Imp6NcYSZYE9Bi";

const base = 'https://api.binance.com';
const method = '/api/v3/account';
const uri = base + method;

const timestamp = Date.now();
const recvWindow = 1000; // Opsiyonel, ihtiyaca göre ayarlanabilir

const params = new URLSearchParams({
    timestamp: timestamp,
    recvWindow: recvWindow
});

// Parametreleri sırala
params.sort();

const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(params.toString())
    .digest('hex');

params.append('signature', signature);

const requestOptions = {
    method: 'GET',
    headers: {
        'X-MBX-APIKEY': API_KEY
    }
};

const requestURL = `${uri}?${params.toString()}`;

console.log('Request URL:', requestURL);

fetch(requestURL, requestOptions)
    .then(res => {
        if (!res.ok) {
            console.error('API Response:', res.status, res.statusText);
            throw new Error(`Network response was not ok: ${res.status} ${res.statusText}`);
        }
        return res.json();
    })
    .then(json => {
        if (json.balances) {
            console.log('Kripto Bakiyeleriniz:');
            for (const item of json.balances) {
                if (parseFloat(item.free) > 0) {
                    console.log('Varlık:', item.asset, 'Boşta:', item.free);
                }
            }
        } else {
            console.log('Yanıtta bakiyeler bulunamadı.');
        }
    })
    .catch(err => console.error('Hata:', err));
