export const shortMoneyString = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue < 1e3) {
    return "₿" + value.toString();
  } else if (absValue < 1e6) {
    return `₿${(value / 1e3).toFixed(1)}K`;
  } else if (absValue < 1e9) {
    return `₿${(value / 1e6).toFixed(1)}M`;
  } else if (absValue < 1e12) {
    return `₿${(value / 1e9).toFixed(1)}B`;
  } else if (absValue < 1e15) {
    return `₿${(value / 1e12).toFixed(1)}T`;
  } else if (absValue < 1e18) {
    return `₿${(value / 1e15).toFixed(1)}P`;
  } else if (absValue < 1e21) {
    return `₿${(value / 1e18).toFixed(1)}E`;
  } else {
    const exponent = Math.floor(Math.log10(absValue));
    const mantissa = (value / Math.pow(10, exponent)).toFixed(1);
    return `₿${mantissa}e${exponent}`;
  }
};
