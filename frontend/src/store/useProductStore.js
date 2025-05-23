import {create} from "zustand";
import axios from "axios";
import {toast} from "react-hot-toast";
import {GoogleDriveAPI, GoogleSheetsAPI} from "../lib/googleLibs";
import {schemas} from "../schemas/initSheetSchema";
import { cancellableWaiting } from "../hooks/waiting";
import { createLogs } from "../funcs/essentialFuncs";

const productSchema = schemas.find((schema)=>schema.sheetName==="Products");
const GOOGLE_SPREADSHEET_NAME = import.meta.env.VITE_GOOGLE_SPREADSHEET_NAME;
const GOOGLE_DRIVE_NAME = import.meta.env.VITE_GOOGLE_DRIVE_NAME;

const passkeyName = localStorage.getItem("passkeyName");
const passkey = localStorage.getItem("passkey");

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "";

export const useProductStore = create((set, get)=>({
    products: [],
    error: null,
    loading: false,
    product: null,
    formData: {name: "", price: "", description: "", image: '', media: []},
    setFormData: (formData)=>set({formData}),
    resetFormData: ()=>set({formData: {name: "", price: "", description: "", image: '', media: []}}),
    updateProduct: async (id, gapi, imagesToDelete)=>{
        set({loading: true});
        try{
            const spreadsheetName = GOOGLE_SPREADSHEET_NAME;
            const sheetName = "Products";
            const {formData, product} = get();
            const newImagesToAdd = formData.media.filter((blob)=>blob?.operation === "add");
            const imagesToUpdate = formData.media.filter((blob)=>(blob?.operation === "update"));
            const getAllMediaInFolder = formData.media.map((blob)=>{
                    if(blob?.operation === "update" || !blob.hasOwnProperty("operation")){
                        console.log({blob})
                        const mediaId = product.mediaIds.find((media)=>media?.id == blob?.id);
                        return {
                            id: mediaId.id,
                            name: mediaId.name,
                            mimeType: mediaId.mimeType
                        }
                    }
                    return null;
            })
            .filter((media)=>media !== null);
            console.log({newImagesToAdd, imagesToUpdate, imagesToDelete, product
                , getAllMediaInFolder
            });
            const googleDrive = new GoogleDriveAPI(gapi);
            const googleSheet = new GoogleSheetsAPI(gapi);
            console.log({folderId: product.mediaFolderId});
            // // update media in the product's folder
            const updateRes = await googleDrive.replaceMultipleFilesInFolder(product.mediaFolderId, imagesToUpdate);
            // // add new media to the prouduct's folder
            const drive = await googleDrive.addMultipleFilesToFolder(product.mediaFolderId, newImagesToAdd);
            // // delete media from the product's folder
            const deleteRes = await googleDrive.deleteMultipleFilesFromFolder(imagesToDelete);

            if(product.name !== formData.name){
                const folderRenameRes = await googleDrive.renameFolder(product.mediaFolderId, formData.name);
            }
            const newMediaIds = [...getAllMediaInFolder, ...drive];

            // construct the spreadsheet row
            const updatedRow = {
                ...product,
                mediaIds: newMediaIds,
                name: formData.name,
                price: formData.price,
                description: formData.description
            }

            const sheetUpdateRes = await googleSheet.updateRowByRowId(spreadsheetName, productSchema.sheetName, productSchema.shape, updatedRow, id);

            if(passkey){
                createLogs("Modified", `
                ${passkeyName} updated a product
                with name ${updatedRow.name}
                and price ${updatedRow.price}
                and description ${updatedRow.description}
                with ${updatedRow.mediaIds.length} media files`)
            }

            // await axios.put(`${BASE_URL}/api/products/${id}`, formData);
            await get().fetchProduct(id, gapi);
            toast.success("Product updated successfully");
        }catch(e){
            console.log(`Error updating product: ${e}`);
            toast.error("Something went wrong");
        }finally{
            set({loading: false});
        }
    },
    fetchProduct: async (id, gapi, retries=10, error=null)=>{
        if(retries === 0){
            if(error){
                set({error: error, product: null, loading: false})
            }
            return;
        }
        set({loading: true});
        const {promise, cancel} = cancellableWaiting(1000);
        try{
            const googleSheet = new GoogleSheetsAPI(gapi);
            const product = await googleSheet.getRowByIndexByName(GOOGLE_SPREADSHEET_NAME, "Products", id);
            set({formData: {name: product.name, price: product.price, description: product.description, image: product.image, media: product.media}, error: null, product: product, loading: false});
            return;
        }catch(e){
            console.warn(`Attempts ${Math.abs(11 - retries)} failed:`,e);
            error = "Something went wrong";
            await promise;
            await get().fetchProduct(id, gapi, retries - 1, error);
            cancel();
        }
    },
    addProduct: async (gapi)=>{
        set({loading: true});
        try{
            const {formData} = get();
            formData.price = (Number(formData.price)).toFixed(2);
            const googleDrive = new GoogleDriveAPI(gapi);
            const googleSheet = new GoogleSheetsAPI(gapi);
            const mediaToDrive = formData.media.map((media)=>media.file);
            const mediaUploadRes = await googleDrive.uploadFilesToDrive(GOOGLE_DRIVE_NAME, formData.name, mediaToDrive);
            const data = {
                name: formData.name,
                price: formData.price,
                description: formData.description,
                ...mediaUploadRes
            }
            await googleSheet.appendRowInPage(GOOGLE_SPREADSHEET_NAME, productSchema.sheetName, data, productSchema.shape);

            if(passkey){
                createLogs("Created", `
                ${passkeyName} created a new product
                with name ${data.name}
                and price ${data.price}
                and description ${data.description}
                with ${data.media.length} media files`)
            }

            set({formData: {name: "", price: "", description: "", image: "", media: []}, error: null});
            document.getElementById("my_modal_2").close();
            toast.success("Product added successfully");
            
            await get().fetchProducts(gapi);
        }catch(e){
            console.log(`Error adding product: ${e}`);
            toast.error("Something went wrong");
        }finally{
            set({loading: false});
        }
    },
    deleteProduct: async (id, gapi, mediaFolderId)=>{
        set({loading: true});
        try{
            const googleDrive = new GoogleDriveAPI(gapi);
            const googleSheet = new GoogleSheetsAPI(gapi);
            // First Delete folder containing the media from google drive if this is successfull
            const driveResult = await googleDrive.deleteFolderAndContents(mediaFolderId);
            // Delete row from google sheet using the spreadSheetName, sheetName, and rowIndex
            // console.log({index: id})
            const sheetResult = await googleSheet.deleteRowAtIndexByName(GOOGLE_SPREADSHEET_NAME, "Products", id-1);
            // console.log({driveResult, sheetResult});
            if(passkey){
                createLogs("Deleted", `${passkeyName} deleted a product with name ${get().product.name} and id ${id}`)
            }

            set((prev)=>(
                {products: prev.products.filter((product)=>product.id !== id)}
            ));
            toast.success("Product deleted successfully");
        }catch(e){
            console.log(`Error deleting product: ${e}`);
            toast.error("Something went wrong");
        }finally{
            set({loading: false});
        }
    },
    fetchProducts: async (gapi, retries = 10, error=null)=>{
        if(retries === 0){
            if(error){
                set({error: error, products: [], loading: false})
            }
            return;
        }
        set({loading: true});
        const {promise, cancel} = cancellableWaiting(1000);
        try{
            const googleSheet = new GoogleSheetsAPI(gapi);
            const products = await googleSheet.getSpreadsheetValuesByName(GOOGLE_SPREADSHEET_NAME, "Products");
            set({products: products.reverse(), error: null, loading: false});
            return;
        }catch(e){
            console.warn(`Attempts ${Math.abs(11 - retries)} failed:`, e);
            error = "Something went wrong";
            await promise;
            await get().fetchProducts(gapi, retries - 1, error);
            cancel();
        }
    }
}));