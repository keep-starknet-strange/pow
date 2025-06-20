export const shortMoneyString = (value: number, includeSymbol: boolean = false): string => {
  const absValue = Math.abs(value);
  if (absValue < 1e3) {
    return includeSymbol ? `₿${value.toFixed(2)}` : value.toFixed(2);
  } else if (absValue < 1e6) {
    return includeSymbol ? `₿${(value / 1e3).toFixed(1)}K` : `${(value / 1e3).toFixed(1)}K`;
  } else if (absValue < 1e9) {
    return includeSymbol ? `₿${(value / 1e6).toFixed(1)}M` : `${(value / 1e6).toFixed(1)}M`;
  } else if (absValue < 1e12) {
    return includeSymbol ? `₿${(value / 1e9).toFixed(1)}B` : `${(value / 1e9).toFixed(1)}B`;
  } else if (absValue < 1e15) {
    return includeSymbol ? `₿${(value / 1e12).toFixed(1)}T` : `${(value / 1e12).toFixed(1)}T`;
  } else if (absValue < 1e18) {
    return includeSymbol ? `₿${(value / 1e15).toFixed(1)}P` : `${(value / 1e15).toFixed(1)}P`;
  } else if (absValue < 1e21) {
    return includeSymbol ? `₿${(value / 1e18).toFixed(1)}E` : `${(value / 1e18).toFixed(1)}E`;
  } else {
    const exponent = Math.floor(Math.log10(absValue));
    const mantissa = (value / Math.pow(10, exponent)).toFixed(1);
    return includeSymbol ? `₿${mantissa}e${exponent}` : `${mantissa}e${exponent}`;
  }
}
