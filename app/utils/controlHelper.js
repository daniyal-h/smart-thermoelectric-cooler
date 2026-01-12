export const getTimeSinceString = (timestamp) => {
  // return time since string in seconds or minutes if >60s

  const timeSince = getTimeSince(timestamp);

  return timeSince <= 60
    ? timeSince + "s ago"
    : Math.round(timeSince / 60) + " mins ago";
};

export const getTimeSince = (timestamp) => {
  // get time since timestamp in seconds
  const now = Math.floor(Date.now() / 1000);
  return Math.round(now - timestamp);
}
