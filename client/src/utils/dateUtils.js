/**
 * Simple date formatting utilities to avoid date-fns dependency issues
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Format a date — matches common date-fns format patterns
 * @param {Date|string} date 
 * @param {string} formatStr 
 */
export const format = (date, formatStr) => {
  const d = new Date(date);
  if (isNaN(d)) return '';

  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes();

  return formatStr
    .replace('MMMM', FULL_MONTHS[month])
    .replace('MMM', MONTHS[month])
    .replace('MM', String(month + 1).padStart(2, '0'))
    .replace('M', String(month + 1))
    .replace('dd', String(day).padStart(2, '0'))
    .replace('d', String(day))
    .replace('yyyy', String(year))
    .replace('yy', String(year).slice(-2))
    .replace('HH', String(hours).padStart(2, '0'))
    .replace('mm', String(minutes).padStart(2, '0'))
    .replace('EEEE', DAYS[d.getDay()]);
};

export const formatRelative = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return format(d, 'MMM d, yyyy');
};
