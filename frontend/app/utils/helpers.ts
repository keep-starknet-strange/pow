export const shortMoneyString = (
  value: number,
  includeSymbol: boolean = false,
  decimals: number = 1,
): string => {
  const absValue = Math.abs(value);
  const prefix = includeSymbol ? "₿" : "";
  const fmt = (n: number) =>
    decimals === 0
      ? Math.round(n).toString()
      : n
          .toFixed(decimals)
          // trim trailing zeros like "1.0" -> "1", "1.50" -> "1.5"
          .replace(/\.0+$|(\.\d*[1-9])0+$/, "$1");

  if (absValue < 1e3) {
    return `${prefix}${value.toFixed(0)}`;
  } else if (absValue < 1e6) {
    return `${prefix}${fmt(value / 1e3)}K`;
  } else if (absValue < 1e9) {
    return `${prefix}${fmt(value / 1e6)}M`;
  } else if (absValue < 1e12) {
    return `${prefix}${fmt(value / 1e9)}B`;
  } else if (absValue < 1e15) {
    return `${prefix}${fmt(value / 1e12)}T`;
  } else if (absValue < 1e18) {
    return `${prefix}${fmt(value / 1e15)}P`;
  } else if (absValue < 1e21) {
    return `${prefix}${fmt(value / 1e18)}E`;
  } else {
    const exponent = Math.floor(Math.log10(absValue));
    const mantissa = fmt(value / Math.pow(10, exponent));
    return `${prefix}${mantissa}e${exponent}`;
  }
};

export const showThreeDigitsMax = (value: number) => {
  const length = value.toString().length;
  if (length % 3 === 0) return 0;
  return 1;
};
