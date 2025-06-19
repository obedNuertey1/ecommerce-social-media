import {create} from "zustand";
import {toast} from "react-hot-toast";
import { GoogleSheetsAPI } from "../lib/googleLibs";
import {schemas} from "../schemas/initSheetSchema";
import { cancellableWaiting } from "../hooks/waiting";

const passkeyLogsSchema = schemas.find((schema)=>schema.sheetName === "PasskeyLogs");
const GOOGLE_SPREADSHEET_NAME = import.meta.env.VITE_GOOGLE_SPREADSHEET_NAME;
const passkeyName = localStorage.getItem("passkeyName");
const passkeyLogs = JSON.parse(localStorage.getItem("passkey_logs"));

export const usePasskeyLogsStore = create((set, get)=>({
    passkeyLogs: [],
    error: null,
    loading: false,
    resetPasskeyLogs: ()=>set({passkeyLogs: []}),
    passkeyLog: null,
    passkeyLogData: {passkeyName: null, privileges: null, accessiblePages: null, activity: null, activityDetails: null, date: null},
    setPasskeyLogs: (passkeyLogs)=>set({passkeyLogs}),
    setPasskeyLogData: (passkeyLogData)=>set({passkeyLogData}),
    resetPasskeyLogData: ()=>set({passkeyLogData: {passkeyName: null, privileges: null, accessiblePages: null, activity: null, activityDetails: null, date: null}}),
    fetchPasskeyLogs: async (gapi, retries = 10, error = null)=>{
        if(retries === 0){
            if(error){
                set({error: error, passkeyLogs: [], loading: false})
            }
            return;
        }
        set({loading: true});
        const {promise, cancel} = cancellableWaiting(1000);
        try{
            const googleSheet = new GoogleSheetsAPI(gapi);
            const passkeyLogs = await googleSheet.getSpreadsheetValuesByName2(GOOGLE_SPREADSHEET_NAME, passkeyLogsSchema.sheetName);
            set({passkeyLogs: passkeyLogs, error: null, loading: false});
            return;
        }catch(e){
            console.warn(`Attempts ${Math.abs(11 - retries)} failed:`, e);
            error = "Something went wrong";
            await promise;
            await get().fetchPasskeyLogs(gapi, retries-1, error);
            cancel();
        }
    },
    fetchPasskeyLogsNoRetries: async (gapi, retries = 1, error = null)=>{
        if(retries === 0){
            if(error){
                set({error: error, passkeyLogs: [], loading: false})
                throw new Error(error);
            }
        }
        set({loading: true});
        const {promise, cancel} = cancellableWaiting(1000);
        try{
            const googleSheet = new GoogleSheetsAPI(gapi);
            console.log("line 55 on usePasskeyLogsStore.js");
            console.log({sheetName: passkeyLogsSchema.sheetName})
            const passkeyLogs = await googleSheet.getSpreadsheetValuesByName2(GOOGLE_SPREADSHEET_NAME, passkeyLogsSchema.sheetName);
            console.log({"works!": passkeyLogs});
            set({passkeyLogs: passkeyLogs, error: null, loading: false});
            return passkeyLogs;
        }catch(e){
            error = "Something went wrong";
            await promise;
            await get().fetchPasskeyLogs(gapi, retries-1, error);
            cancel();
        }
    },
    bulkAddPasskeyLogs: async (gapi)=>{
        try{
            if(passkeyLogs){
                const newPasskeyLogs = JSON.parse(localStorage.getItem("passkey_logs"))?.map((logs)=>{
                    return {
                        ...logs,
                        privileges: JSON.stringify(logs.privileges),
                        accessiblePages: JSON.stringify(logs.accessiblePages)
                    }
                })                
                const googleSheet = new GoogleSheetsAPI(gapi);
                await googleSheet.appendRowInPage(GOOGLE_SPREADSHEET_NAME, passkeyLogsSchema.sheetName, newPasskeyLogs, passkeyLogsSchema.shape);
                console.log({passkeyLogsSchema, newPasskeyLogs});
            }
            const randomNum = Math.random() * 1000;
            return [String(randomNum)];
        }catch(e){
            console.log(`Error adding passkey logs: ${e}`);
            return new Error(`Error adding passkey logs: ${e}`);
        }
    },
    bulkDeletePasskeyLogs: async (id, gapi)=>{
        // set({loading: true});
        try{
           const googleSheet = new GoogleSheetsAPI(gapi);
           const sheetResult = await googleSheet.deleteRowAtIndexByName(GOOGLE_SPREADSHEET_NAME, passkeyLogsSchema.sheetName, id-1);
           set((prev)=>({
            passkeyLogs: prev.passkeyLogs.filter((passkeyLog)=>passkeyLog.id !== id)
           })) 
           toast.success("Passkey log deleted successfully");
        }catch(e){
            console.log(`Error deleting passkey log: ${e}`);
            toast.error("Something went wrong");
        }
        // finally{
        //     set({loading: false});
        // }
    },
    deletePasskeyLog: async (id, gapi)=>{
        try{
            const googleSheet = new GoogleSheetsAPI(gapi);
            const sheetResult = await googleSheet.deleteRowAtIndexByName(GOOGLE_SPREADSHEET_NAME, passkeyLogsSchema.sheetName, id-1);
            set((prev)=>({
                passkeyLogs: prev.passkeyLogs.filter((passkeyLog)=>passkeyLog.id !== id)
            }))
            toast.success("Passkey log deleted successfully");
        }catch(e){
            console.log(`Error deleting passkey log: ${e}`);
            toast.error("Something went wrong");
        }
    },
    updatePasskeyLog: async (gapi, id)=>{
        // set({loading: true})
        try{
            const spreadsheetName = GOOGLE_SPREADSHEET_NAME;
            const googleSheet = new GoogleSheetsAPI(gapi);
            const {passkeyLogs} = get();
            const passkeyLog = passkeyLogs.find((passkeyLog)=>passkeyLog.id===id)
            passkeyLog.phone = Array.isArray(passkeyLog.phone)?[...passkeyLog.phone]:[passkeyLog.phone];
            // console.log({phone: passkeyLog.phone});
            const sheetUpdates = await googleSheet.updateRowByRowId(spreadsheetName, passkeyLogsSchema.sheetName, passkeyLogsSchema.shape, passkeyLog, id);
            set({loading: false, error: null});
            toast.success("Passkey log update successful");
            return sheetUpdates;
        }catch(e){
            console.log(`Error updating passkey log: ${e}`);
            toast.error("Passkey log update error");
            return null;
        }
        // finally{
        //     set({loading: false})
        // }
    }
}))