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