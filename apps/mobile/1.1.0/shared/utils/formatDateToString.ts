/**
 * Formats a given date into a human-readable string using the active language locale.
 *
 * @param dateInput - A Date object or a valid date string.
 * @param locale - Optional locale override. Defaults to the active app language.
 * @returns A formatted date string.
 */
export const formatDateToString = (dateInput: Date | string, locale?: string): string => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (isNaN(date.getTime())) {
    console.warn('Invalid date provided to formatDateToString');
    return '';
  }

  const normalizedLocale = locale || 'en-US';

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return date.toLocaleDateString(normalizedLocale, options);
};