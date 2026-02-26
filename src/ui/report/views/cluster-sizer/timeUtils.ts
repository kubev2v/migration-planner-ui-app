/**
 * Parses a Go duration string (e.g., "989h19m27.587096774s") and returns
 * the total number of seconds.
 */
export const parseDuration = (duration: string): number => {
  let totalSeconds = 0;

  const hoursMatch = duration.match(/(\d+)h/);
  if (hoursMatch) {
    totalSeconds += parseInt(hoursMatch[1], 10) * 3600;
  }

  const minutesMatch = duration.match(/(\d+)m/);
  if (minutesMatch) {
    totalSeconds += parseInt(minutesMatch[1], 10) * 60;
  }

  const secondsMatch = duration.match(/(\d+(?:\.\d+)?)s/);
  if (secondsMatch) {
    totalSeconds += parseFloat(secondsMatch[1]);
  }

  return totalSeconds;
};

/**
 * Formats a duration string (e.g., "989h19m27.587096774s") into a
 * human-readable format like "41 days 5 hours 19 minutes".
 */
export const formatDuration = (duration: string): string => {
  const totalSeconds = parseDuration(duration);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  }
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  }

  return parts.join(" ");
};
