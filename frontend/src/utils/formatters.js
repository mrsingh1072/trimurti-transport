/**
 * Format number with thousand separators
 * 2847 → "2,847"
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Format large numbers with abbreviations
 * 1200000 → "1.2M"
 * 1200 → "1.2K"
 */
export const formatLargeNumber = (num) => {
  if (!num && num !== 0) return '0'
  
  const absNum = Math.abs(num)
  
  if (absNum >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (absNum >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  
  return num.toString()
}

/**
 * Format currency with INR symbol
 * 1200000 → "₹12,00,000"
 */
export const formatCurrency = (num, symbol = '₹') => {
  if (!num && num !== 0) return symbol + '0'
  
  // Indian numbering system (use comma every 2 digits after first 3)
  const formatted = Math.floor(num)
    .toString()
    .replace(/\B(?=(\d{2})+(?!\d))/g, ',')
  
  return symbol + formatted
}

/**
 * Format percentage
 * 98.5 → "98.5%"
 */
export const formatPercentage = (num) => {
  if (!num && num !== 0) return '0%'
  return num.toFixed(1) + '%'
}

/**
 * Format growth indicator
 * 156 → "+156%"
 * -50 → "-50%"
 */
export const formatGrowth = (num) => {
  if (!num && num !== 0) return '0%'
  const sign = num > 0 ? '+' : ''
  return sign + num.toFixed(1) + '%'
}
