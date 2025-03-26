// ./contexts/GoogleAuthContext.jsx
import { useContext, useState, createContext, useEffect, useRef, useLayoutEffect } from "react";
import { gapi } from "gapi-script";
import { GoogleDriveAPI, GoogleSheetsAPI } from "../lib/googleLibs";
import { schemas as initSheetSchema } from "../schemas/initSheetSchema";
import { useSettingsStore } from "../store/useSettingsStore";
import { cancellableWaiting } from "../funcs/waiting";

const AuthContext = createContext(null);

export function useGoogleAuthContext() {
    return useContext(AuthContext);
}


// Configuration 1
// const CLIENT_ID = "384372585523-uckdjngronpg7it0m1udkvqget6d8a70.apps.googleusercontent.com";
// const API_KEY = "AIzaSyBkhdhK-GMELzebWxjVof_8iW8lUdfYza4";
// const CLIENT_SECRET = "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";

// Configuration 2
// const CLIENT_ID = "735897969269-79cbatqg3sv47pvgi8famqnqjv289kg4.apps.googleusercontent.com";
// const API_KEY = "AIzaSyA_L0ecj-L4zEfRYfnkEcN7iFMjvyPbGLg";
// const CLIENT_SECRET = "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";

// Configuration 3
const CLIENT_ID = "910108858778-o50b1l20nuscpivqco8munjb3i9rffsj.apps.googleusercontent.com";
const API_KEY = "AIzaSyDybWEDPdJ6ERF2GMf9pkbD5fB1wmpAnOQ";
const CLIENT_SECRET = "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";

export function GoogleAuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState("");
    const [files, setFiles] = useState(null);
    const initializationStarted = useRef(false);
    
    const {settingsSchema, loadSettings} = useSettingsStore();

    useEffect(() => {
        const initializeGapiClient = async () => {
            if (initializationStarted.current) return;
            initializationStarted.current = true;
            // const {promise, cancel} = cancellableWaiting(1500);
            try {
                await gapi.client.init({
                    apiKey: API_KEY,
                    clientId: CLIENT_ID,
                    scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets',
                    discoveryDocs: [
                        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
                        'https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest',
                    ],
                });

                const authInstance = gapi.auth2.getAuthInstance();
                const isSignedIn = await authInstance.isSignedIn.get();
                const title = "EcommerceSpreadSheet";

                setIsAuthenticated(isSignedIn);
                if (isSignedIn) {
                    // console.log({initSheetSchema})
                    const googleDrive = new GoogleDriveAPI(gapi);
                    const googleSheet = new GoogleSheetsAPI(gapi);
                    const driveRes = await googleDrive.createFolderIfNotExists("EcommerceWebsite");
                    initSheetSchema.push(settingsSchema())
                    const sheetRes = await googleSheet.createSpreadsheetWithSheetsAndHeaders(title, initSheetSchema);
                    // const sheetRes = await googleSheet.updateHeadersByName(title, initSheetSchema);
                    // console.log({ driveRes, sheetRes })
                    await loadSettings(gapi);
                }
                // await promise;
            } catch (err) {
                console.error('Error initializing GAPI client:', err);
                setError("Failed to initialize Google API client. Please try again.");
            }
            // finally{
            //     cancel();
            // }
        }
        gapi.load('client:auth2', initializeGapiClient);
    }, [])

    const handleLoginSuccess = (response) => {
        localStorage.setItem("logged-in", 'true');
        setIsAuthenticated(true);
        gapi.auth2.getAuthInstance().signIn()
        // Do something like list files or something
        // console.log("Logged in successfully:", response);
        localStorage.setItem("logged-in", 'true');
        // console.log(response);
    }

    const handleLoginFailure = (response) => {
        setError("Failed to authenticate. Please try again.");
    }

    const value = {
        gapi,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}