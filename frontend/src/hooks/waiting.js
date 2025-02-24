export const waiting = (ms)=>{
    return new Promise((resolve)=>{
        setTimeout(resolve, ms);
    })
}