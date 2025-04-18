import * as Comlink from "comlink";
import funcsWorker from "../workers/funcsWorker?worker";

export const convert2dArrToObjArr = async (arr) => {
    const worker = new funcsWorker();
    const funcs = Comlink.wrap(worker);

    const result = await funcs.convert2dArrToObjArr(arr)
    return result;
}

export const getMediaUrls = async (products) => {
    const worker = new funcsWorker();
    const funcs = Comlink.wrap(worker);

    const result = await funcs.getMediaUrls(products)
    return result;
}

export const objectDifference = async (arr1, arr2) => {
    const worker = new funcsWorker();
    const funcs = Comlink.wrap(worker);

    const result = await funcs.objectDifference(arr1, arr2);
    return result;
}

export const textToSpeech = (text, lang = "en-US", pitch = 1, rate = 1, voice = 0, volume = 1) => {
    function loadVoices() {
        const voices = window.speechSynthesis.getVoices();
        console.log("Available voices:", voices);
    }
    // Sometimes voices load asynchronously so we set an event listener.
    window.speechSynthesis.onvoiceschanged = loadVoices;

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = lang;
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = volume;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        utterance.voice = voices[voice]
    }

    window.speechSynthesis.speak(utterance);
}
// export const textToSpeech = async (
//     text,
//     lang = "en-US",
//     pitch = 1,
//     rate = 1,
//     voiceIndex = 0,
//     volume = 1
// ) => {
//     // Wait for voices to load
//     const voices = await new Promise((resolve) => {
//         const voices = window.speechSynthesis.getVoices();
//         if (voices.length) return resolve(voices);

//         window.speechSynthesis.onvoiceschanged = () => {
//             resolve(window.speechSynthesis.getVoices());
//         };
//     });

//     const utterance = new SpeechSynthesisUtterance(text);

//     utterance.lang = lang;
//     utterance.pitch = pitch;
//     utterance.rate = rate;
//     utterance.volume = volume;

//     // Validate and set voice
//     if (voices[voiceIndex]) {
//         utterance.voice = voices[voiceIndex];
//     } else {
//         console.warn(`Voice index ${voiceIndex} not available, using default voice`);
//     }

//     window.speechSynthesis.speak(utterance);
// };

// export const textToSpeech = (text, lang = "en-US", pitch = 1, rate = 1, voice = 0, volume = 1) => {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = lang;
//     utterance.pitch = pitch;
//     utterance.rate = rate;
//     utterance.volume = volume;

//     function speakWhenVoicesReady() {
//         const voices = window.speechSynthesis.getVoices();
//         if (voices.length > 0) {
//             // Set the selected voice.
//             utterance.voice = voices[voice];
//             window.speechSynthesis.speak(utterance);
//         } else {
//             // If no voices available yet, try again after 100ms.
//             setTimeout(speakWhenVoicesReady, 100);
//         }
//     }

//     // Option 1: Listen for the voiceschanged event, then speak.
//     window.speechSynthesis.onvoiceschanged = speakWhenVoicesReady;

//     // Option 2: Immediately try to speak; if voices aren't ready, our recursive function will handle it.
//     speakWhenVoicesReady();
// };

export const encryptData = async (plaintext, password) => {
    const worker = new funcsWorker();
    const funcs = Comlink.wrap(worker);

    const result = await funcs.encryptData(plaintext, password);
    return result;
}

export const decryptData = async (encryptedData, password) => {
    const worker = new funcsWorker();
    const funcs = Comlink.wrap(worker);

    const result = await funcs.decryptData(encryptedData, password);
    return result;
}

export const getUserIdFromIdToken = (idToken) => {
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload.sub;
}

export const privilegeAccess = () => {
    const normalLogin = !localStorage.hasOwnProperty("passkey");

    const creatableAccess = normalLogin || (JSON.parse(localStorage.getItem("privileges")).includes("admin"));

    const deletableAccess = normalLogin || (JSON.parse(localStorage.getItem("privileges")).includes("admin") || JSON.parse(localStorage.getItem("privileges")).includes("editor"));

    const updatableAccess = normalLogin || (JSON.parse(localStorage.getItem("privileges")).includes("admin") || JSON.parse(localStorage.getItem("privileges")).includes("editor"));

    const readableAccess = normalLogin || (JSON.parse(localStorage.getItem("privileges")).includes("admin") || JSON.parse(localStorage.getItem("privileges")).includes("viewer") || JSON.parse(localStorage.getItem("privileges")).includes("editor") || JSON.parse(localStorage.getItem("privileges")).includes("billing"));

    return {
        creatableAccess,
        deletableAccess,
        updatableAccess,
        readableAccess
    };
}