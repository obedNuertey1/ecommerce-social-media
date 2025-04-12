// ./contexts/GoogleAuthContext.jsx
import { useContext, useState, createContext, useEffect, useRef, useLayoutEffect } from "react";
import { gapi } from "gapi-script";
import { GoogleDriveAPI, GoogleSheetsAPI } from "../lib/googleLibs";
import { schemas as initSheetSchema } from "../schemas/initSheetSchema";
import { useSettingsStore } from "../store/useSettingsStore";
import { cancellableWaiting } from "../funcs/waiting";
import useQuery from "../hooks/useQuery";
import useTokenRefresh from "../hooks/useTokenRefresh";
import { getUserIdFromIdToken } from "../funcs/essentialFuncs"
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function useGoogleAuthContext() {
    return useContext(AuthContext);
}

// Configuration 1
// const CLIENT_ID = "384372585523-uckdjngronpg7it0m1udkvqget6d8a70.apps.googleusercontent.com";
// const API_KEY = "AIzaSyBkhdhK-GMELzebWxjVof_8iW8lUdfYza4";
// const CLIENT_SECRET = "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";

// Configuration temporary
const ORIGIN = window.location.origin;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${ORIGIN}${import.meta.env.VITE_GOOGLE_REDIRECT_URI}`;
const GOOGLE_SPREADSHEET_NAME = import.meta.env.VITE_GOOGLE_SPREADSHEET_NAME;
const GOOGLE_DRIVE_NAME = import.meta.env.VITE_GOOGLE_DRIVE_NAME;

// Configuration 2
// const CLIENT_ID = "735897969269-79cbatqg3sv47pvgi8famqnqjv289kg4.apps.googleusercontent.com";
// const API_KEY = "AIzaSyA_L0ecj-L4zEfRYfnkEcN7iFMjvyPbGLg";
// const CLIENT_SECRET = "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";

// Configuration 3
// const CLIENT_ID = "910108858778-o50b1l20nuscpivqco8munjb3i9rffsj.apps.googleusercontent.com";
// const API_KEY = "AIzaSyDybWEDPdJ6ERF2GMf9pkbD5fB1wmpAnOQ";
// const CLIENT_SECRET = "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";

export function GoogleAuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState("");
    const [files, setFiles] = useState(null);
    const initializationStarted = useRef(false);
    const navigate = useNavigate();
    // const query = useQuery();
    // const code = query.get("code");
    const { settingsSchema, loadSettings} = useSettingsStore();
    useTokenRefresh();


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

                const storedToken = localStorage.getItem("googleAuthToken");
                if (storedToken) {
                    gapi.auth.setToken(JSON.parse(storedToken));
                    gapi.client.setToken(JSON.parse(storedToken));
                }

                const authInstance = gapi.auth2.getAuthInstance();
                const isSignedIn = await authInstance.isSignedIn.get();
                const title = GOOGLE_SPREADSHEET_NAME;

                setIsAuthenticated(isSignedIn);
                if (isSignedIn || gapi.auth.getToken().access_token || gapi.client.getToken().access_token) {
                    localStorage.setItem('logged-in', 'true');
                } else if (!isSignedIn || !gapi.auth.getToken().access_token || !gapi.client.getToken().access_token) {
                    localStorage.setItem("logged-in", "false");
                }

                console.log("Before if (isSignedIn) { This is supposed to house the authData");
                if (isSignedIn) {
                    // console.log({initSheetSchema})
                    const googleDrive = new GoogleDriveAPI(gapi);
                    const googleSheet = new GoogleSheetsAPI(gapi);
                    const driveRes = await googleDrive.createFolderIfNotExists(GOOGLE_DRIVE_NAME);
                    initSheetSchema.push(settingsSchema())
                    const sheetRes = await googleSheet.createSpreadsheetWithSheetsAndHeaders(title, initSheetSchema);
                    const authData = await googleSheet.getRowByIndexByName(GOOGLE_SPREADSHEET_NAME, "Auth", 2);
                    console.log("After if (isSignedIn) { This is supposed to house the authData");

                    // Check google spreadsheet if google refresh token exist
                    console.log("This is supposed to house the authData");
                    // if (authData) {
                    //     console.log({authData})
                    //     if (authData.googleRefreshToken) {
                    //         // console.log("This is authData:",{authData});
                    //         const id_token = gapi.auth.getToken().id_token;
                    //         const googleUserId = authData.googleUserId;
                    //         const userId = getUserIdFromIdToken(id_token);
                    //         // console.log("googleUserId === userId",(googleUserId === userId))
                    //         // Check if google userId matches spreadsheet userId
                    //         if (googleUserId !== userId) {
                    //             gapi.auth2.getAuthInstance().signOut();
                    //             localStorage.clear();
                    //             localStorage.setItem('logged-in', 'false');
                    //             navigate("/auth");
                    //         } else if (googleUserId === userId) {
                    //             // Check if logged in meta tokens is equal to spreadsheet meta tokens
                    //             // if false update Auth sheet with new meta tokens
                    //             // clear userIds and meta auth tokens from localstorage (do same with google drive)
                    //         }
                    //     }
                    // } else if (!authData) {
                    //     console.log("else if (!authData) {")
                    //     // Means the user is a new user
                    //     // If so we need to create a refresh token for the new user
                    //     // logoutuser
                    //     gapi.auth2.getAuthInstance().signOut()
                    //     localStorage.clear();
                    //     const {cancel, promise} = cancellableWaiting(3000);
                    //     await promise;
                    //     // redirect to authenticate page by getting code
                    //     const url = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/drive%20https://www.googleapis.com/auth/spreadsheets%20https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile&access_type=offline&prompt=consent
                    //     `;
                    //     const link = document.createElement("a");
                    //     link.href = url;
                    //     document.body.appendChild(link);
                    //     cancel();
                    //     link.click();
                    //     document.body.removeChild(link);
                    // }

                    await googleSheet.updateHeadersByName(title, initSheetSchema);
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
        // return () => { }
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