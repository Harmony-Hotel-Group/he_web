import currencyData from '@/data/currency.json';

export const convertCurrency = (amountUSD: number, targetCurrency: string): number => {
  const rate = currencyData[targetCurrency as keyof typeof currencyData]?.rate || 1;
  return amountUSD * rate;
};

export const formatCurrency = (amount: number, currency: string): string => {
  const currencyInfo = currencyData[currency as keyof typeof currencyData];
  if (!currencyInfo) {
    return `${amount.toFixed(2)}`;
  }

  const { symbol } = currencyInfo;
  return `${symbol}${amount.toFixed(2)}`;
};

export const getCurrencySymbol = (currency: string): string => {
  return currencyData[currency as keyof typeof currencyData]?.symbol || currency;
};

export const getAvailableCurrencies = () => {
  return Object.keys(currencyData);
};