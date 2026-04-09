export const getTimeSinceString = (timestamp) => {
    // return time since string in seconds or minutes if >60s
    const timeSince = getTimeSince(timestamp);
    const mins = Math.round(timeSince / 60);

    const pluralSuffix = mins == 1 ? "" : "s";
    return timeSince <= 60
        ? timeSince + "s ago"
        : mins + " min" + pluralSuffix + " ago";
};

export const getTimeSince = (timestamp) => {
    // get time since timestamp in seconds
    const now = Math.floor(Date.now() / 1000);
    return Math.round(now - timestamp);
};
