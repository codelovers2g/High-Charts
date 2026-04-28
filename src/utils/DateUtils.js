/**
 * Enterprise Date Utilities for Charting
 */

export const ChartDateRange = {
  YEAR: 0,
  MONTH: 1,
  DAY: 2,
  QUARTER: 3
};

/**
 * Calculates the minimum timestamp based on the selected range.
 * @param {Object} selectedRange - { type, count }
 * @returns {number} Timestamp
 */
export function calculateMinDate(selectedRange) {
  if (!selectedRange) return null;
  
  const date = new Date();
  const { type, count } = selectedRange;

  switch (type) {
    case ChartDateRange.YEAR:
      return date.setFullYear(date.getFullYear() - count);
    case ChartDateRange.MONTH:
    case ChartDateRange.QUARTER: // Usually quarter is handled as months
      return date.setMonth(date.getMonth() - count);
    case ChartDateRange.DAY:
      return date.setDate(date.getDate() - count);
    default:
      return date.getTime();
  }
}

/**
 * Formats currency values for display
 * @param {number} value 
 * @returns {string}
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}
