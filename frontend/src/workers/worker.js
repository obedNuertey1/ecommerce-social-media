import {expose} from 'comlink';

// Define the API you want to expose to the main thread.
const api = {
    add(a, b){
        return a + b;
    },
    async delayEcho(message){
        await new Promise((resolve)=>setTimeout(resolve, 1000));
        return message;
    }
}

expose(api);