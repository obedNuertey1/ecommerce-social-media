import {create} from "zustand";
import {toast} from "react-hot-toast";
import {GoogleSheetsAPI} from "../lib/googleLibs";
import {schemas} from "../schemas/initSheetSchema";
import {cancellableWaiting} from "../hooks/waiting";
import {objectDifference} from "../funcs/essentialFuncs";

const orderSchema = schemas.find((schema)=>schema.sheetName === "Orders");
const newOrderSchema = schemas.find((schema)=>schema.sheetName === "NewOrders");

export const useOrderStore = create((set, get)=>({
    orders: [],
    error: null,
    loading: false,
    newOrders: [],
    resetNewOrders: ()=>set({newOrders: []}),
    order: null,
    orderData: {orderId: null, phone: null, items: null, total: null, status: "new"},
    setOrders: (orders)=>set({orders}),
    setOrderData: (orderData)=>set({orderData}),
    resetOrderData: ()=>set({orderData: {orderId: null, phone: null, items: null, total: null, status: "new"}}),
    fetchOrders: async (gapi, retries = 10, error = null)=>{
        if(retries === 0){
            if(error){
                set({error: error, orders: [], loading: false})
            }
            return;
        }
        set({loading: true});
        const {promise, cancel} = cancellableWaiting(1000);
        try{
            const googleSheet = new GoogleSheetsAPI(gapi);
            const orders = await googleSheet.getSpreadsheetValuesByName2("EcommerceSpreadSheet", orderSchema.sheetName);
            const allOrders = orders.map((elem, idx)=>{
                if(Array.isArray(elem.phone)){
                    elem.phone = elem.phone[0];
                }
                elem["orderNumber"] = `#${String(idx + 1).padStart(3, '0')}`
                elem["id"] = idx + 2;
                return elem
            })
            
            set({orders: allOrders, error: null, loading: false});
            return;
        }catch(e){
            console.warn(`Attempts ${Math.abs(11 - retries)} failed:`, e);
            error = "Something went wrong";
            await promise;
            await get().fetchOrders(gapi, retries-1, error);
            cancel();
        }
    },
    fetchNewOrders: async (gapi, retries = 1, error = null)=>{
        if(retries === 0){
            if(error){
                set({error: error, orders: [], loading: false})
            }
            return [];
        }
        set({loading: true});
        const {promise, cancel} = cancellableWaiting(1000);
        try{
            const googleSheet = new GoogleSheetsAPI(gapi);
            const orders = await googleSheet.getSpreadsheetValuesByName2("EcommerceSpreadSheet", orderSchema.sheetName);
            const newOrdersNotif = await googleSheet.getSpreadsheetValuesByName2("EcommerceSpreadSheet", newOrderSchema.sheetName);
            const allOrders = orders.map((elem, idx)=>{
                if(Array.isArray(elem.phone)){
                    elem.phone = elem.phone[0];
                }
                elem["orderNumber"] = `#${String(idx + 1).padStart(3, '0')}`
                elem["id"] = idx + 2;
                return elem
            })
            const notifyOrders = newOrdersNotif.map((elem, idx)=>{
                if(Array.isArray(elem.phone)){
                    elem.phone = elem.phone[0];
                }
                elem["orderNumber"] = `#${String(idx + 1).padStart(3, '0')}`
                elem["id"] = idx + 2;
                return elem
            })
            
            set({orders: allOrders , error: null, loading: false});
            
            if(notifyOrders.length > 0){
                await googleSheet.deleteAllRowsByName("EcommerceSpreadSheet", newOrderSchema.sheetName, [1, notifyOrders.length]);
            }
            return notifyOrders || [];
        }catch(e){
            console.warn(`Attempts ${Math.abs(11 - retries)} failed:`, e);
            error = "Something went wrong";
            await promise;
            await get().fetchOrders(gapi, retries-1, error);
            cancel();
        }
    },
    addOrder: async (gapi)=>{
        // set({loading: true});
        try{
            const {orderData, orders} = get();
            // orderData.total = (Number(orderData.total)).toFixed(2);
            const googleSheet = new GoogleSheetsAPI(gapi);
            await googleSheet.appendRowInPage("EcommerceSpreadSheet", orderSchema.sheetName, orderData, orderSchema.shape);
            await googleSheet.appendRowInPage("EcommerceSpreadSheet", newOrderSchema.sheetName, orderData, newOrderSchema.shape);
            set({orderData: {orderId: null, phone: null, items: null, total: null, status: "New"}, error: null});
            toast.success("Order added successfully");

            // get previous orders and save it in the localStorage under recent_orders

            // await get().fetchOrders(gapi);
        }catch(e){
            console.log(`Error adding order: ${e}`);
            toast.error("Something went wrong");
        }
        // finally{
        //     set({loading: false});
        // }
    },
    deleteOrder: async (id, gapi)=>{
        // set({loading: true});
        try{
           const googleSheet = new GoogleSheetsAPI(gapi);
           const sheetResult = await googleSheet.deleteRowAtIndexByName("EcommerceSpreadSheet", orderSchema.sheetName, id-1);
           set((prev)=>({
            orders: prev.orders.filter((order)=>order.id !== id)
           })) 
           toast.success("Order deleted successfully");
        }catch(e){
            console.log(`Error deleting product: ${e}`);
            toast.error("Something went wrong");
        }
        // finally{
        //     set({loading: false});
        // }
    },
    updateOrder: async (gapi, id)=>{
        // set({loading: true})
        try{
            const spreadsheetName = "EcommerceSpreadSheet";
            const googleSheet = new GoogleSheetsAPI(gapi);
            const {orders} = get();
            const order = orders.find((order)=>order.id===id)
            order.phone = Array.isArray(order.phone)?[...order.phone]:[order.phone];
            // console.log({phone: order.phone});
            const sheetUpdates = await googleSheet.updateRowByRowId(spreadsheetName, orderSchema.sheetName, orderSchema.shape, order, id);
            set({loading: false, error: null});
            toast.success("Status update successful");
            return sheetUpdates;
        }catch(e){
            console.log(`Error updating status: ${e}`);
            toast.error("Status update error");
            return null;
        }
        // finally{
        //     set({loading: false})
        // }
    }
}))