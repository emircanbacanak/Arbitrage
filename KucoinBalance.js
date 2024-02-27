const crypto = require('crypto');
const fetch = require('node-fetch'); // node-fetch modülünü ekledim

const API_KEY = "dfed49bc-1e43-4756-b557-10848023992b"
const API_SECRET = "af5/xhclYraNsX30giKC42M1djtsuQ6A"

const base = 'https://api.btcturk.com'
const method = '/api/v1/users/balances'
const uri = base + method;

const options = { method: 'GET', headers: authentication() };

fetch(uri, options)
    .then(res => res.json())
    .then(json => {
        // Her bir özelliği dönerek asset ve balance değerlerini al
        for (const item of json.data) {
            console.log('Asset:', item.asset, 'Balance:', item.balance);
        }
    })
    .catch(err => console.error('error:', err));




function authentication() {
    const stamp = (new Date()).getTime()
    const data = Buffer.from(`${API_KEY}${stamp}`, 'utf8')
    const buffer = crypto.createHmac('sha256', Buffer.from(API_SECRET, 'base64'))
    buffer.update(data)
    const digest = buffer.digest()
    const signature = Buffer.from(digest.toString('base64'), 'utf8').toString('utf8')

    return {
        "Content-type": 'application/json',
        "X-PCK": API_KEY,
        "X-Stamp": stamp.toString(),
        "X-Signature": signature,
    }
}
