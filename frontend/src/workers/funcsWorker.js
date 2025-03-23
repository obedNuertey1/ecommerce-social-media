import {expose} from "comlink";

const func = {
    convert2dArrToObjArr(arr){
        const keys = arr[0];
        const restOfArr = arr.slice(1, arr.length)
        const result = restOfArr.map((elem1, idx)=>{
            let obj = {};
            keys.forEach((elem, i)=>{
                let val = elem1[i] || null;
                if((elem1[i]?.startsWith("[") && elem1[i]?.endsWith("]")) || (elem1[i]?.startsWith("{") && elem1[i]?.endsWith("}"))){
                    val = JSON.parse(elem1[i]);
                }
                obj[elem] = val;
            })
            obj.id = idx+2;
            return obj;
        })
        return result;
    },
    getMediaUrls(products){
        return products.map((product)=>{
            let media = product.mediaIds.map((mediaId)=>(`https://drive.google.com/thumbnail?id=${mediaId}&sz=s800`));
            let image = media.length > 0 ? media[0] : "https://plus.unsplash.com/premium_vector-1736769626427-4aeac3ae63e5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG5vdCUyMGZvdW5kfGVufDB8fDB8fHww";
            product.image = image;
            product.media = media;
            return product;
        })
    }
}

expose(func);