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
    },
    encryptData(plaintext, password) {
        function textToArrayBuffer(str) {
            return new TextEncoder().encode(str).buffer;
        }

        function arrayBufferToBase64(buffer) {
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        }

        return (async (plaintext, password) => {
            try {
                const salt = crypto.getRandomValues(new Uint8Array(16));
                const iv = crypto.getRandomValues(new Uint8Array(12));

                const keyMaterial = await crypto.subtle.importKey(
                    "raw",
                    textToArrayBuffer(password),
                    "PBKDF2",
                    false,
                    ["deriveKey"]
                );

                const key = await crypto.subtle.deriveKey(
                    {
                        name: "PBKDF2",
                        salt,
                        iterations: 100000,
                        hash: "SHA-256",
                    },
                    keyMaterial,
                    { name: "AES-GCM", length: 256 },
                    true,
                    ["encrypt", "decrypt"]
                );

                const ciphertext = await crypto.subtle.encrypt(
                    { name: "AES-GCM", iv },
                    key,
                    textToArrayBuffer(plaintext)
                );

                return [
                    arrayBufferToBase64(salt),
                    arrayBufferToBase64(iv),
                    arrayBufferToBase64(ciphertext),
                ].join(".");
            } catch (error) {
                throw new Error("Encryption failed: " + error.message);
            }
        })(plaintext, password);
    },
    decryptData(encryptedData, password) {
        function textToArrayBuffer(str) {
            return new TextEncoder().encode(str).buffer;
        }

        function arrayBufferToText(buffer) {
            return new TextDecoder().decode(buffer);
        }

        function base64ToArrayBuffer(base64) {
            const binaryString = atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        }

        return (async (encryptedData, password) => {
            try {
                const [saltB64, ivB64, ciphertextB64] = encryptedData.split(".");
                if (!saltB64 || !ivB64 || !ciphertextB64) {
                    throw new Error("Invalid encrypted data format");
                }

                const salt = base64ToArrayBuffer(saltB64);
                const iv = base64ToArrayBuffer(ivB64);
                const ciphertext = base64ToArrayBuffer(ciphertextB64);

                const keyMaterial = await crypto.subtle.importKey(
                    "raw",
                    textToArrayBuffer(password),
                    "PBKDF2",
                    false,
                    ["deriveKey"]
                );

                const key = await crypto.subtle.deriveKey(
                    {
                        name: "PBKDF2",
                        salt,
                        iterations: 100000,
                        hash: "SHA-256",
                    },
                    keyMaterial,
                    { name: "AES-GCM", length: 256 },
                    true,
                    ["decrypt"]
                );

                const plaintextBuffer = await crypto.subtle.decrypt(
                    { name: "AES-GCM", iv },
                    key,
                    ciphertext
                );

                return arrayBufferToText(plaintextBuffer);
            } catch (error) {
                throw new Error("Decryption failed: " + error.message);
            }
        })(encryptedData, password);
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