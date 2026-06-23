/**
 * Formats a 'YYYY-MM' string to 'Mon YYYY' (e.g. '2025-11' → 'Nov 2025').
 * Returns 'Present' for a null end date.
 */
export function formatYearMonth(value: string | null): string {
  if (value === null) return 'Present';
  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}
