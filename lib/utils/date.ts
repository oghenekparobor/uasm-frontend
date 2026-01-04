/**
 * Formats a date string or Date object into a readable format.
 * e.g., "Jun 23rd, 2025"
 * @param dateInput The date string or Date object to format.
 * @param options Intl.DateTimeFormatOptions for customization.
 * @returns Formatted date string or 'N/A' if invalid.
 */
export function formatDate(
  dateInput: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  if (!dateInput) {
    return 'N/A';
  }

  let date: Date;
  if (typeof dateInput === 'string') {
    try {
      date = new Date(dateInput);
    } catch (e) {
      console.error('Failed to parse date string:', dateInput, e);
      return 'Invalid Date';
    }
  } else {
    date = dateInput;
  }

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  // Use Intl.DateTimeFormat for locale-aware formatting
  const formatter = new Intl.DateTimeFormat('en-US', options);
  return formatter.format(date);
}

