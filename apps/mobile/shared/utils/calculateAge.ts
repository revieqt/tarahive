/**
 * Calculates the age based on the birthdate.
 * @param birthdate - The birthdate (Date object or date string)
 * @returns {number} - The calculated age
 */

export function calculateAge(birthdate: Date | string): number {
  const date = birthdate instanceof Date ? birthdate : new Date(birthdate);
  
  if (isNaN(date.getTime())) {
    console.warn("Invalid date provided to calculateAge");
    return 0;
  }
  
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age;
} 