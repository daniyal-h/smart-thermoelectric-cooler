export const getTimeSince = (timestamp) => {
  // return time since in seconds or minutes if >60s

  const now = Math.floor(Date.now() / 1000); // now in sec
  const timeSince = Math.round(now - timestamp);

  return timeSince <= 60 ? timeSince + "s ago" : Math.round(timeSince / 60) + " mins ago";
};
