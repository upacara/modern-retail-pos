/**
 * Formats integer amounts into Indonesian Rupiah without decimals (e.g., Rp10.000, Rp25.500).
 */
export function formatIDR(amount) {
  const num = Math.round(Number(amount) || 0);
  const sign = num < 0 ? '-' : '';
  const formatted = Math.abs(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}Rp${formatted}`;
}

export function parseNumericInput(raw) {
  const cleaned = String(raw || '').replace(/[^\d]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}
