export const formatNumber = (numberString, maxDecimalPlaces) => {
  return parseFloat(numberString).toLocaleString("en-US", {
    maximumFractionDigits: maxDecimalPlaces,
  });
};
