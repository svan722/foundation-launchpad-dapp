const bn = require("bignumber.js");

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

export function sqrtPriceX96Encoder(reserve1, reserve0, decimals1, decimals0) {
  if (parseInt(decimals1) !== parseInt(decimals0)) {
    // Adjust reserves based on decimal places
    if (decimals1 > decimals0) {
      reserve0 = reserve0 / 10 ** (decimals1 - decimals0);
    } else {
      reserve1 = reserve1 / 10 ** (decimals0 - decimals1);
    }
  }

  return new bn(reserve1.toString())
    .div(reserve0.toString())
    .sqrt()
    .multipliedBy(new bn(2).pow(96))
    .integerValue(3)
    .toString();
}
