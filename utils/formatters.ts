export const formatDuration = (ms: number) => {
    if (ms < 0) ms = -ms;
    const hour = Math.floor(ms / 3600000) % 24;
    const minute = Math.floor(ms / 60000) % 60;
    const second = Math.floor(ms / 1000) % 60;
    return `${hour > 0 ? `${hour}:` : ''}${minute < 10 ? `0${minute}` : minute}:${second < 10 ? `0${second}` : second}`;
};