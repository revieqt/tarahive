export const formatDateToString = (dateInput: Date | string): string => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (isNaN(date.getTime())) {
    console.warn("Invalid date provided to formatDateToString");
    return "";
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
};