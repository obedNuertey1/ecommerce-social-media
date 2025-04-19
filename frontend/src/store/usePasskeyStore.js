import { create } from "zustand";
import { toast } from "react-hot-toast";
import { GoogleSheetsAPI } from "../lib/googleLibs";
import { schemas } from "../schemas/initSheetSchema";
import { cancellableWaiting } from "../hooks/waiting";

const passkeySchema = schemas.find((schema) => schema.sheetName === "Passkeys");
const GOOGLE_SPREADSHEET_NAME = import.meta.env.VITE_GOOGLE_SPREADSHEET_NAME;

export const usePasskeyStore = create((set, get) => ({
    passkeys: [],
    error: null,
    loading: false,
    updateAddLoading: false,
    passkey: { name: '', passkey: '', privileges: [], accessiblePages: [] },
    setPasskey: (passkey) => set({ passkey }),
    resetPasskey: () => set({ passkey: { name: '', passkey: '', privileges: [], accessiblePages: [] } }),
    fetchPasskeys: async (gapi, retries = 10, error = null) => {
        if (retries === 0) {
            if (error) {
                set({ error: error, passkeys: [], loading: false });
            }
            return get().passkeys;
        }
        set({ loading: true });
        const { promise, cancel } = cancellableWaiting(1000);
        try {
            const googleSheet = new GoogleSheetsAPI(gapi);
            const passkeys = await googleSheet.getSpreadsheetValuesByName2(GOOGLE_SPREADSHEET_NAME, passkeySchema.sheetName);
            const allPasskeys = passkeys?.map((elem, idx) => {
                elem["id"] = idx + 2;
                return elem;
            });
            set({ passkeys: allPasskeys, error: null, loading: false });
            return allPasskeys;
        } catch (e) {
            console.warn(`Attempts ${Math.abs(11 - retries)} failed:`, e);
            error = "Something went wrong";
            await promise;
            await get().fetchPasskeys(gapi, retries - 1, error);
            cancel();
        }
    },
    fetchPasskeys2: async (gapi, retries = 2, error = null) => {
        if (retries === 0) {
            if (error) {
                set({ passkeys: [] });
            }
            return get().passkeys;
        }
        const { promise, cancel } = cancellableWaiting(1000);
        try {
            const googleSheet = new GoogleSheetsAPI(gapi);
            const passkeys = await googleSheet.getSpreadsheetValuesByName2(GOOGLE_SPREADSHEET_NAME, passkeySchema.sheetName);
            const allPasskeys = passkeys?.map((elem, idx) => {
                elem["id"] = idx + 2;
                return elem;
            });
            set({ passkeys: allPasskeys });
            return allPasskeys;
        } catch (e) {
            console.warn(`Attempts ${Math.abs(11 - retries)} failed:`, e);
            error = "Something went wrong";
            await promise;
            await get().fetchPasskeys(gapi, retries - 1, error);
            cancel();
        }
    },
    addPasskey: async (gapi) => {
        set({updateAddLoading: true});
        try {
            const { passkey, passkeys, fetchPasskeys } = get();
            const googleSheet = new GoogleSheetsAPI(gapi);
            await googleSheet.appendRowInPage(GOOGLE_SPREADSHEET_NAME, passkeySchema.sheetName, passkey, passkeySchema.shape);
            set({ passkey: { name: '', passkey: '', privileges: [], accessiblePages: [] }, error: null });
            await fetchPasskeys(gapi);
        } catch (e) {
            console.log(`Error adding passkey: ${e}`);
            // toast.error("Something went wrong");
        }finally{
            set({updateAddLoading: false});
        }
    },
    deletePasskey: async (id, gapi) => {
        try {
            const googleSheet = new GoogleSheetsAPI(gapi);
            const sheetResult = await googleSheet.deleteRowAtIndexByName(GOOGLE_SPREADSHEET_NAME, passkeySchema.sheetName, id - 1);
            set((prev) => ({
                passkeys: prev.passkeys.filter((passkey) => passkey.id !== id)
            }))
        } catch (e) {
            console.log(`Error deleting passkey: ${e}`);
            toast.error("Something went wrong");
        }
    },
    updatePasskey: async (gapi, id) => {
        set({updateAddLoading: true});
        try {
            const spreadsheetName = GOOGLE_SPREADSHEET_NAME;
            const googleSheet = new GoogleSheetsAPI(gapi);
            const { passkey, fetchPasskeys } = get();
            // const passkey = passkeys.find((passkey) => passkey.id === id);
            const sheetUpdates = await googleSheet.updateRowByRowId(spreadsheetName, passkeySchema.sheetName, passkeySchema.shape, passkey, id);
            set({ loading: false, error: null, passkey: { name: '', passkey: '', privileges: [], accessiblePages: [] }});
            await fetchPasskeys(gapi);
            // toast.success("Passkey updated successfully");
            set({updateAddLoading: false});
            // let getIsLoggedIn = localStorage.getItem("logged-in") === "true";
            // if (getIsLoggedIn) {
            //     window.location.reload();
            // }
            // console.log({sheetUpdates})
            return sheetUpdates;
        } catch (e) {
            console.log(`Error updating passkey: ${e}`);
            toast.error("Status update error");
            set({updateAddLoading: false});
            throw new Error("Passkey could not update");
        }
    },
    fetchPasskey: async (id, gapi, retries = 10, error = null) => {
        if (retries === 0) {
            if (error) {
                set({ error: null, passkeys: [], loading: false });
                return {error: new Error(error)};
            }
            return {error: new Error("Passkey could not fetch")};
        }
        const { promise, cancel } = cancellableWaiting(1000);
        try {
            const googleSheet = new GoogleSheetsAPI(gapi);
            const passkey = await googleSheet.getRowByIndexByName(GOOGLE_SPREADSHEET_NAME, passkeySchema.sheetName, id - 1);
            set({ error: null });
            return passkey;
        } catch (e) {
            console.warn(`Attempts ${Math.abs(11 - retries)} failed:`, e);
            error = e;
            await promise;
            await get().fetchPasskey(id, gapi, retries - 1, error);
            cancel();
        }
    }
}));