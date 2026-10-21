/**
 * Format number as Indonesian Rupiah (IDR)
 */
export function formatRupiah(value: number, compact = false): string {
  if (isNaN(value)) return 'Rp 0';

  if (compact) {
    if (Math.abs(value) >= 1_000_000_000) {
      return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
    }
    if (Math.abs(value) >= 1_000_000) {
      return `Rp ${(value / 1_000_000).toFixed(1)} Jt`;
    }
    if (Math.abs(value) >= 1_000) {
      return `Rp ${(value / 1_000).toFixed(0)} Rb`;
    }
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format standard percentage
 */
export function formatPercent(value: number, decimals = 1): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format localized date (Indonesian)
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number): string {
  if (isNaN(value)) return '0';
  return new Intl.NumberFormat('id-ID').format(value);
}
