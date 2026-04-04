export const formatDate = (date: string | Date, lang: string = "mn") => {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const day = d.getDate();
  const month = d.getMonth();

  if (lang === "mn") {
    // Manual Mongolian format: "3-р сарын 28"
    return `${month + 1}-р сарын ${day}`;
  }

  // Default to English format "Mar 28"
  const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthsEn[month]} ${day}`;
};
