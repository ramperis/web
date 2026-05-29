'use strict';
const crypto = require('crypto');
const https  = require('https');

const REGION  = 'eu-west-1';
const SERVICE = 'ProductAdvertisingAPI';
const HOST    = 'webservices.amazon.es';
const PATH    = '/paapi5/getitems';

function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}
function sha256hex(data) {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

function buildAuthorization(accessKey, secret, amzDate, canonicalRequest) {
  const dateStamp       = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256hex(canonicalRequest),
  ].join('\n');

  const kSigning  = hmac(hmac(hmac(hmac(`AWS4${secret}`, dateStamp), REGION), SERVICE), 'aws4_request');
  const signature = hmac(kSigning, stringToSign).toString('hex');

  return (
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=content-encoding;content-type;host;x-amz-date;x-amz-target, ` +
    `Signature=${signature}`
  );
}

function papiRequest(payload, amzDate, authorization) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      path:     PATH,
      method:   'POST',
      headers: {
        'content-encoding': 'amz-1.0',
        'content-type':     'application/json; charset=utf-8',
        'host':             HOST,
        'x-amz-date':       amzDate,
        'x-amz-target':     'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
        'Authorization':    authorization,
      },
    };

    const httpReq = https.request(options, httpRes => {
      let body = '';
      httpRes.on('data', chunk => (body += chunk));
      httpRes.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('Respuesta no válida de PA-API: ' + body.slice(0, 300))); }
      });
    });

    httpReq.on('error', reject);
    httpReq.write(payload);
    httpReq.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  const { asin } = req.query;
  if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) {
    return res.status(400).json({ error: 'ASIN inválido' });
  }

  const AMAZON_ACCESS_KEY  = process.env.AMAZON_ACCESS_KEY?.trim();
  const AMAZON_SECRET_KEY  = process.env.AMAZON_SECRET_KEY?.trim();
  const AMAZON_ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG?.trim();
  if (!AMAZON_ACCESS_KEY || !AMAZON_SECRET_KEY || !AMAZON_ASSOCIATE_TAG) {
    return res.status(500).json({ error: 'Configuración de Amazon incompleta' });
  }

  const payload = JSON.stringify({
    ItemIds:     [asin],
    Resources:   ['Images.Primary.Large', 'ItemInfo.Title', 'Offers.Listings.Price'],
    PartnerTag:  AMAZON_ASSOCIATE_TAG,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.es',
  });

  // amzDate: YYYYMMDDTHHMMSSZ
  const amzDate = new Date().toISOString().replace(/[:\-]/g, '').slice(0, 15) + 'Z';

  // Headers sorted alphabetically for canonical request
  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${HOST}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems\n`;

  const signedHeadersList = 'content-encoding;content-type;host;x-amz-date;x-amz-target';

  const canonicalRequest = [
    'POST',
    PATH,
    '',                          // empty query string
    canonicalHeaders,            // already ends with \n per header
    signedHeadersList,
    sha256hex(payload),
  ].join('\n');

  const authorization = buildAuthorization(AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, amzDate, canonicalRequest);

  // Temporary debug: detect invalid header characters before the request
  const badChars = [...authorization].filter(c => {
    const code = c.charCodeAt(0);
    return code < 32 || code > 126;
  });
  if (badChars.length > 0) {
    return res.status(500).json({
      error: 'Invalid chars in Authorization',
      codes: badChars.map(c => c.charCodeAt(0)),
      keyLen: AMAZON_ACCESS_KEY.length,
      secretLen: AMAZON_SECRET_KEY.length,
    });
  }

  try {
    const data  = await papiRequest(payload, amzDate, authorization);
    const items = data?.ItemsResult?.Items;

    if (!items?.length) {
      return res.status(404).json({ error: 'Producto no encontrado', debug: data });
    }

    const item  = items[0];
    const title = item?.ItemInfo?.Title?.DisplayValue ?? '';
    const image = item?.Images?.Primary?.Large?.URL   ?? '';
    const price = item?.Offers?.Listings?.[0]?.Price?.DisplayAmount ?? null;
    const url   = `https://www.amazon.es/dp/${asin}?tag=${AMAZON_ASSOCIATE_TAG}`;

    return res.status(200).json({ title, image, price, url });
  } catch (err) {
    console.error('[amazon-product]', err.message, err.stack);
    return res.status(500).json({
      error: err.message,
      details: err.stack,
    });
  }
};
