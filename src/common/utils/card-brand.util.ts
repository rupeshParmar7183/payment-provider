export function detectCardBrand(
  cardNumber: string,
): string {
  if (/^4/.test(cardNumber)) {
    return 'VISA';
  }

  if (
    /^(5[1-5])/.test(cardNumber)
  ) {
    return 'MASTERCARD';
  }

  if (/^3[47]/.test(cardNumber)) {
    return 'AMEX';
  }

  if (/^6(?:011|5)/.test(cardNumber)) {
    return 'DISCOVER';
  }

  return 'UNKNOWN';
}