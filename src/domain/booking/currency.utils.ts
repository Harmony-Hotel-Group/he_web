/**
 * src/domain/booking/currency.utils.ts
 * 
 * Utilidades para el manejo de monedas y precios.
 * Esta lógica estaba previamente en InfoCard.astro y ahora
 * está centralizada para mejor mantenibilidad.
 */

export type Currency = 'USD' | 'EUR' | 'GBP';

export interface Money {
  amount: number;
  currency: Currency;
}

export interface ExchangeRates {
  [key: string]: number;
}

/**
 * Tasas de cambio por defecto (USD como base)
 * Estas pueden ser reemplazadas por tasas dinámicas del ERP
 */
export const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79
};

/**
 * Símbolos de moneda
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£'
};

/**
 * Nombres de moneda
 */
export const CURRENCY_NAMES: Record<Currency, string> = {
  USD: 'Dólar estadounidense',
  EUR: 'Euro',
  GBP: 'Libra esterlina'
};

/**
 * Obtiene la moneda preferida del usuario desde las cookies
 * 
 * @param cookies - Objeto de cookies de Astro
 * @returns Moneda preferida (default: USD)
 */
export function getPreferredCurrency(cookies: Record<string, unknown>): Currency {
  const currencyCookie = cookies['currency'] as string | undefined;
  
  if (currencyCookie && isValidCurrency(currencyCookie)) {
    return currencyCookie as Currency;
  }
  
  return 'USD';
}

/**
 * Valida si una moneda es válida
 * 
 * @param currency - Código de moneda
 * @returns true si la moneda es válida
 */
export function isValidCurrency(currency: string): boolean {
  return ['USD', 'EUR', 'GBP'].includes(currency.toUpperCase());
}

/**
 * Convierte un monto de una moneda a otra
 * 
 * @param amount - Monto original
 * @param fromCurrency - Moneda origen
 * @param toCurrency - Moneda destino
 * @param rates - Tasas de cambio
 * @returns Monto convertido
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: ExchangeRates = DEFAULT_EXCHANGE_RATES
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Convertir a USD primero (base)
  const amountInUsd = amount / (rates[fromCurrency] || 1);
  
  // Convertir de USD a la moneda destino
  return amountInUsd * (rates[toCurrency] || 1);
}

/**
 * Formatea un monto con el símbolo de la moneda
 * 
 * @param amount - Monto a formatear
 * @param currency - Código de moneda
 * @param locale - Locale para formateo
 * @returns Monto formateado
 */
export function formatMoney(
  amount: number,
  currency: Currency = 'USD',
  locale: string = 'es-EC'
): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formattedAmount = amount.toFixed(2);
  
  return `${symbol}${formattedAmount}`;
}

/**
 * Formatea un monto completo con el nombre de la moneda
 * 
 * @param amount - Monto a formatear
 * @param currency - Código de moneda
 * @returns Monto formateado con nombre
 */
export function formatMoneyFull(
  amount: number,
  currency: Currency = 'USD'
): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const name = CURRENCY_NAMES[currency];
  
  return `${symbol}${amount.toFixed(2)} ${name}`;
}

/**
 * Obtiene el tipo de cambio entre dos monedas
 * 
 * @param fromCurrency - Moneda origen
 * @param toCurrency - Moneda destino
 * @param rates - Tasas de cambio
 * @returns Tipo de cambio
 */
export function getExchangeRate(
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: ExchangeRates = DEFAULT_EXCHANGE_RATES
): number {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  
  return (rates[toCurrency] || 1) / (rates[fromCurrency] || 1);
}

/**
 * Convierte un precio y retorna el monto formateado
 * 
 * @param priceInUsd - Precio en USD
 * @param targetCurrency - Moneda objetivo
 * @param rates - Tasas de cambio
 * @returns Precio formateado
 */
export function convertAndFormat(
  priceInUsd: number,
  targetCurrency: Currency,
  rates: ExchangeRates = DEFAULT_EXCHANGE_RATES
): string {
  const converted = convertCurrency(priceInUsd, 'USD', targetCurrency, rates);
  return formatMoney(converted, targetCurrency);
}

/**
 * Valida que un monto sea válido
 * 
 * @param amount - Monto a validar
 * @returns true si el monto es válido
 */
export function isValidAmount(amount: unknown): boolean {
  if (typeof amount !== 'number') {
    return false;
  }
  
  return !isNaN(amount) && amount >= 0;
}
