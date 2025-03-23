import {create} from "zustand";
import axios from "axios";
import {toast} from "react-hot-toast";
import {GoogleDriveAPI, GoogleSheetsAPI} from "../lib/googleLibs";
import {schemas} from "../schemas/initSheetSchema";
import { cancellableWaiting } from "../hooks/waiting";

const productSchema = schemas.find((schema)=>schema.sheetName==="Products");

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "";

export const useProductStore = create((set, get)=>({
    products: [],
    error: null,
    loading: false,
    product: null,
    formData: {name: "", price: "", description: "", image: '', media: []},
    setFormData: (formData)=>set({formData}),
    resetFormData: ()=>set({formData: {name: "", price: "", description: "", image: '', media: []}}),
    updateProduct: async (id)=>{
        set({loading: true});
        try{
            const {formData} = get();
            await axios.put(`${BASE_URL}/api/products/${id}`, formData);
            await get().fetchProduct(id);
            toast.success("Product updated successfully");
        }catch(e){
            console.log(`Error updating product: ${e}`);
            toast.error("Something went wrong");
        }finally{
            set({loading: false});
        }
    },
    fetchProduct: async (id, gapi)=>{
        set({loading: true});
        try{
            const googleSheet = new GoogleSheetsAPI(gapi);
            const product = await googleSheet.getRowByIndexByName("EcommerceSpreadSheet", "Products", id);
            console.log({product});
            set({formData: {name: product.name, price: product.price, description: product.description, image: product.image, media: product.media}, error: null, product: product})
        }catch(e){
            console.log(`Error fetching product: ${e}`);
            toast.error("Something went wrong");
        }finally{
            set({loading: false});
        }
        // try{
        //     const response = await axios.get(`${BASE_URL}/api/products/${id}`);
        //     set({formData: {...response.data.data, media: [response.data.data.image, "https://plus.unsplash.com/premium_photo-1681336999500-e4f96fe367f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aXBob25lfGVufDB8fDB8fHww", "https://images.unsplash.com/photo-1530319067432-f2a729c03db5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aXBob25lfGVufDB8fDB8fHww", "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aXBob25lfGVufDB8fDB8fHww"]}, error: null, product: {...response.data.data, media:[ response.data.data.image]}})
        //     console.log({product: get().product})
        // }catch(e){
        //     console.log("Error fetching product ", e);
        //     set({error: "Something went wrong", product: null});
        // }finally{
        //     set({loading: false});
        // }
    },
    addProduct: async (gapi)=>{
        set({loading: true});
        try{
            const {formData} = get();
            formData.price = (Number(formData.price)).toFixed(2);
            const googleDrive = new GoogleDriveAPI(gapi);
            const googleSheet = new GoogleSheetsAPI(gapi);
            const mediaToDrive = formData.media.map((media)=>media.file);
            const mediaUploadRes = await googleDrive.uploadFilesToDrive("EcommerceWebsite", formData.name, mediaToDrive);
            const data = {
                name: formData.name,
                price: formData.price,
                description: formData.description,
                ...mediaUploadRes
            }
            await googleSheet.appendRowInPage("EcommerceSpreadSheet", productSchema.sheetName, data, productSchema.shape);
            set({formData: {name: "", price: "", description: "", image: "", media: []}, error: null});
            document.getElementById("my_modal_2").close();
            toast.success("Product added successfully");
            
            await get().fetchProducts();
        }catch(e){
            console.log(`Error adding product: ${e}`);
            toast.error("Something went wrong");
        }finally{
            set({loading: false});
        }
        // try{
        //     const {formData} = get();
        //     await axios.post(`${BASE_URL}/api/products`, formData);
        //     await get().fetchProducts();
        //     set({formData: {name: "", price: "", image: ""}});
        //     toast.success("Product added successfully");
        //     document.getElementById("my_modal_2").close();
        // }catch(e){
        //     console.log(`Error adding product: ${e}`);
        //     toast.error("Something went wrong");
        // }finally{
        //     set({loading: false});
        // }
    },
    deleteProduct: async (id, gapi, mediaFolderId)=>{
        set({loading: true});
        try{
            const googleDrive = new GoogleDriveAPI(gapi);
            const googleSheet = new GoogleSheetsAPI(gapi);
            // First Delete folder containing the media from google drive if this is successfull
            const driveResult = await googleDrive.deleteFolderAndContents(mediaFolderId);
            // Delete row from google sheet using the spreadSheetName, sheetName, and rowIndex
            console.log({index: id})
            const sheetResult = await googleSheet.deleteRowAtIndexByName("EcommerceSpreadSheet", "Products", id-1);
            console.log({driveResult, sheetResult});
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
        // try{
        //     await axios.delete(`${BASE_URL}/api/products/${id}`);
        //     set((prev)=>(
        //         {products: prev.products.filter((product)=> product.id !== id)}
        //     )
        //     );
        //     toast.success("Product deleted successfully");
        // }catch(e){
        //     console.log(`Error deleting product: ${e}`);
        //     toast.error("Something went wrong");
        // }finally{
        //     set({loading: false});
        // }
    },
    fetchProducts: async ()=>{
        set({loading: true});
        const {promise, cancel} = cancellableWaiting(3500);
        try{
            // Get all products from GoogleSheetsAPI
            await promise;
            const googleSheet = new GoogleSheetsAPI(gapi);
            const products = await googleSheet.getSpreadsheetValuesByName("EcommerceSpreadSheet", "Products");
            console.log({products});
            set({products: products.reverse(), error: null});
        }catch(e){
            set({error: "Something went wrong", products: []});
        }finally{
            set({loading: false});
            cancel();
        }
        // try{
        //     const response = await axios.get(`${BASE_URL}/api/products`);
        //     set({products: response.data.data, error: null});
        // }catch(e){
        //     if(e.status === 429){
        //         set({error: "Rate Limit exceeded", products: []});
        //     }else{
        //         set({error: "Something went wrong", products: []});
        //     }
        // }finally{
        //     set({loading: false});
        // }
    }
}));