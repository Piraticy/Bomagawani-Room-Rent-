const fetch = require('node-fetch');
const { db } = require('../db');

const CACHE_HOURS = 6;

function hoursSince(dateString) {
  const normalized = /Z$|[+-]\d{2}:?\d{2}$/.test(dateString) ? dateString : `${dateString}Z`;
  const then = new Date(normalized.replace(' ', 'T')).getTime();
  return (Date.now() - then) / (1000 * 60 * 60);
}

async function fetchRates(baseCurrency = 'USD') {
  const base = (baseCurrency || 'USD').toUpperCase();
  const cached = await db.prepare('SELECT rates_json, updated_at FROM exchange_cache WHERE base_currency = ?').get(base);

  if (cached && hoursSince(cached.updated_at) <= CACHE_HOURS) {
    return JSON.parse(cached.rates_json);
  }

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`, {
      timeout: 7000
    });

    if (!response.ok) {
      throw new Error(`Currency API failed with status ${response.status}`);
    }

    const payload = await response.json();
    if (!payload || payload.result !== 'success' || !payload.rates) {
      throw new Error('Currency API returned invalid payload.');
    }

    const rates = payload.rates;
    await db.prepare(`
      INSERT INTO exchange_cache (base_currency, rates_json, updated_at)
      VALUES (@base_currency, @rates_json, CURRENT_TIMESTAMP)
      ON CONFLICT(base_currency)
      DO UPDATE SET rates_json = excluded.rates_json, updated_at = CURRENT_TIMESTAMP
    `).run({
      base_currency: base,
      rates_json: JSON.stringify(rates)
    });

    return rates;
  } catch (error) {
    if (cached) {
      return JSON.parse(cached.rates_json);
    }

    return {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      TZS: 2600,
      AED: 3.67,
      KES: 129
    };
  }
}

async function convertFromUSD(usdAmount, targetCurrency) {
  const target = (targetCurrency || 'USD').toUpperCase();
  const rates = await fetchRates('USD');
  const rate = rates[target] || 1;
  return {
    rate,
    total: Number((usdAmount * rate).toFixed(2)),
    currency: target
  };
}

async function convertFromEUR(eurAmount, targetCurrency) {
  const rates = await fetchRates('USD');
  const eurRate = rates.EUR || 0.92;
  return convertFromUSD(eurAmount / eurRate, targetCurrency);
}

module.exports = {
  fetchRates,
  convertFromUSD,
  convertFromEUR
};
