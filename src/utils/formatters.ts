/**
 * Formats a number to Indian Rupee currency format (e.g. ₹1,42,850 or ₹460)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  const rounded = Math.round(amount * 100) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
  }).format(rounded);
}

/**
 * Formats a plain number to Indian numbering system (e.g. 1,42,850)
 */
export function formatNumberIN(num: number): string {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Formats ISO timestamp to human friendly relative time (e.g. "5 mins ago", "Today at 2:30 PM")
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    const hoursStr = hours < 10 ? '0' + hours : hours;
    return `${hoursStr}:${minutesStr} ${ampm}`;
  } catch {
    return dateString;
  }
}

/**
 * Generate sequential order number
 */
export function generateOrderNumber(existingCount: number): string {
  return `ORD-${1044 + existingCount}`;
}
