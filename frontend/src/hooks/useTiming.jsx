import {useRef, useCallback} from "react";

const useTiming = (ms)=>{
    const timeoutRef = useRef(null);

    const startTimer = async ()=>(
        new Promise((res)=>{
            if(timeoutRef.current){
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(res, ms);
        })
    )

    const clearTimer = useCallback(()=>{
        if(timeoutRef.current){
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    return [startTimer, clearTimer];
}

export default useTiming;