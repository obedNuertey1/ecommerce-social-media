import { expose } from "comlink";

const func = {
    convert2dArrToObjArr(arr) {
        const keys = arr[0];
        const restOfArr = arr.slice(1, arr.length)
        const result = restOfArr.map((elem1, idx) => {
            let obj = {};
            keys.forEach((elem, i) => {
                let val = elem1[i] || null;
                if ((elem1[i]?.startsWith("[") && elem1[i]?.endsWith("]")) || (elem1[i]?.startsWith("{") && elem1[i]?.endsWith("}"))) {
                    val = JSON.parse(elem1[i]);
                }
                obj[elem] = val;
            })
            obj.id = idx + 2;
            return obj;
        })
        return result;
    },
    getMediaUrls(products) {
        return products.map((product) => {
            let media = product.mediaIds.map((mediaId) => ({
                id: mediaId.id,
                mediaUrl: (mediaId.mimeType.startsWith("image/")) ? `https://drive.google.com/thumbnail?id=${mediaId.id}&sz=s800`/*`https://lh3.googleusercontent.com/d/${mediaId.id}=s800`*/ : `https://drive.google.com/file/d/${mediaId.id}/preview`,
                mimeType: mediaId.mimeType
            }));
            let image = media.length > 0 ? media[0] : { id: null, mediaUrl: "https://plus.unsplash.com/premium_vector-1736769626427-4aeac3ae63e5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG5vdCUyMGZvdW5kfGVufDB8fDB8fHww", mimeType: "image/jpeg" };
            product.image = image;
            product.media = media;
            return product;
        })
    },
    objectDifference(arr1, arr2) {
        const stringify = obj => JSON.stringify(obj);

        const set1 = new Set(arr1.map(stringify));
        const set2 = new Set(arr2.map(stringify));

        const uniqueInArr1 = arr1.filter(obj => !set2.has(stringify(obj)));
        const uniqueInArr2 = arr2.filter(obj => !set1.has(stringify(obj)));

        // Combine both unique lists and remove duplicates by orderId
        const newArr = [...uniqueInArr1, ...uniqueInArr2];
        const uniqueArr = [];

        newArr.forEach(obj => {
            if (!uniqueArr.some(existingObj => existingObj.orderId === obj.orderId)) {
                uniqueArr.push(obj);
            }
        });

        // return uniqueArr
        return uniqueArr.filter(obj => obj.status === "new");
    }
    // , objectDifference(arr1, arr2) {
    //     function isEqual(obj1, obj2) {
    //         return Object.keys(obj1).length === Object.keys(obj2).length &&
    //             Object.keys(obj1).every(key => obj1[key] === obj2[key]);
    //     }

    //     if (arr2.length > arr1.length) {
    //         const difference = arr2.filter(obj2 => {
    //             return !arr1.some(obj1 => isEqual(obj1, obj2));
    //         });
    //         return difference;
    //     } else if (arr2.length <= arr1.length) {
    //         const difference = arr1.filter(obj2 => {
    //             return !arr2.some(obj1 => isEqual(obj1, obj2));
    //         });
    //         return difference;
    //     }
    //     return [];
    // }
}

expose(func);