import {create} from "zustand";
import axios from "axios";
import {toast} from "react-hot-toast";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "";

export const useProductStore = create((set, get)=>({
    products: [],
    error: null,
    loading: false,
    product: null,
    formData: {name: "", price: "", image: ""},
    setFormData: (formData)=>set({formData}),
    resetFormData: ()=>set({formData: {name:"", price: "", image: ""}}),
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
    fetchProduct: async (id)=>{
        set({loading: true});
        try{
            const response = await axios.get(`${BASE_URL}/api/products/${id}`);
            console.log("response.data=",response.data);
            set({formData: response.data.data, error: null, product: response.data.data})
        }catch(e){
            console.log("Error fetching product ", e);
            set({error: "Something went wrong", product: null});
        }finally{
            set({loading: false});
        }
    },
    addProduct: async ()=>{
        set({loading: true});
        try{
            const {formData} = get();
            await axios.post(`${BASE_URL}/api/products`, formData);
            await get().fetchProducts();
            set({formData: {name: "", price: "", image: ""}});
            toast.success("Product added successfully");
            document.getElementById("my_modal_2").close();
        }catch(e){
            console.log(`Error adding product: ${e}`);
            toast.error("Something went wrong");
        }finally{
            set({loading: false});
        }
    },
    deleteProduct: async (id)=>{
        set({loading: true});
        try{
            await axios.delete(`${BASE_URL}/api/products/${id}`);
            set((prev)=>(
                {products: prev.products.filter((product)=> product.id !== id)}
            )
            );
            toast.success("Product deleted successfully");
        }catch(e){
            console.log(`Error deleting product: ${e}`);
            toast.error("Something went wrong");
        }finally{
            set({loading: false});
        }
    },
    fetchProducts: async ()=>{
        set({loading: true});
        try{
            const response = await axios.get(`${BASE_URL}/api/products`);
            set({products: response.data.data, error: null});
        }catch(e){
            if(e.status === 429){
                set({error: "Rate Limit exceeded", products: []});
            }else{
                set({error: "Something went wrong", products: []});
            }
        }finally{
            set({loading: false});
        }
    }
}));