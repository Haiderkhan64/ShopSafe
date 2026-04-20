export function formatCurrency(
  amount: number,
  currencyCode: string = "USD"
): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
    }).format(amount);
  } catch (error) {
    console.error(
      `formatCurrency: invalid currency code "${currencyCode}"`,
      error
    );
    // Graceful fallback — show the number so the user isn't left with a blank
    return amount.toFixed(2);
  }
}