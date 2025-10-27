// Currency Utility Functions for INR

export const USD_TO_INR_RATE = 83; // Approximate conversion rate

/**
 * Convert USD to INR
 */
export const convertToINR = (usdAmount: number): number => {
  return Math.round(usdAmount * USD_TO_INR_RATE);
};

/**
 * Format number as INR currency
 */
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format USD price to INR
 */
export const formatUSDtoINR = (usdAmount: number): string => {
  const inrAmount = convertToINR(usdAmount);
  return formatINR(inrAmount);
};

/**
 * Parse INR string to number
 */
export const parseINR = (inrString: string): number => {
  return parseInt(inrString.replace(/[^0-9]/g, ''), 10);
};

/**
 * Format with Indian numbering system (lakhs, crores)
 */
export const formatIndianNumber = (num: number): string => {
  const x = num.toString();
  const lastThree = x.substring(x.length - 3);
  const otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers !== '') {
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  return lastThree;
};
