export const cancellableWaiting = (ms) => {
    let timeoutId;
    const promise = new Promise((resolve, reject) => {
        timeoutId = setTimeout(resolve, ms);
    });
    return {
        promise,
        cancel: () => {
            return clearTimeout(timeoutId)
        }
    };
};