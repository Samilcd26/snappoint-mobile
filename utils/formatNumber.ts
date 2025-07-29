// Format numbers with limits (round down to be fair)
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return Math.floor(num / 100000) / 10 + 'M';
  } else if (num >= 1000) {
    return Math.floor(num / 100) / 10 + 'K';
  }
  return num.toString();
}; 