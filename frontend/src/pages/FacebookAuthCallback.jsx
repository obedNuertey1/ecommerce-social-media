import React, { useEffect, useRef, useState } from 'react';
import { useGoogleAuthContext } from "../contexts/GoogleAuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { GoogleDriveAPI, GoogleSheetsAPI } from "../lib/googleLibs";
import { getUserIdFromIdToken } from "../funcs/essentialFuncs";
import { cancellableWaiting } from "../funcs/waiting";
import { useSettingsStore } from "../store/useSettingsStore.js";
import { schemas as initSheetSchema } from "../schemas/initSheetSchema";

const CLIENT_ID = "735897969269-0nhfejn5pre40a511kvcprm6551bon5n.apps.googleusercontent.com";
const API_KEY = "AIzaSyBkhdhK-GMELzebWxjVof_8iW8lUdfYza4";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:5173/google/auth/callback/";

function FacebookCallback() {
    const googleButtonRef = useRef(null);
    const { gapi } = useGoogleAuthContext();
    const { loadSettings, settingsSchema } = useSettingsStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (googleButtonRef.current) {
            googleButtonRef.current.click();
        }
    }, []);

    const [googleIsLoading, setGoogleIsLoading] = useState(false);
    useEffect(() => {
        return () => {
            setGoogleIsLoading(false);
            localStorage.removeItem("facebookAuthCallbackActivated");
        }
    }, []);
    const handleGoogleLogin = async () => {
        setGoogleIsLoading(true);
        const { cancel, promise } = cancellableWaiting(3000);
        await promise;
        gapi.auth2.getAuthInstance().signIn()
            .then(async (googleUser) => {
                cancel();
                // Access basic profile information
                const profile = googleUser.getBasicProfile();
                console.log("ID: " + profile.getId());
                console.log("Name: " + profile.getName());
                console.log("Image URL: " + profile.getImageUrl());
                console.log("Email: " + profile.getEmail());
                console.log("gapi.auth.getToken()=", gapi.auth.getToken());

                // You can also access the auth response, which includes the access token.
                const authResponse = googleUser.getAuthResponse();
                console.log("Access Token: ", authResponse.access_token);
                try {
                    // When we want to use the oauth way of authentication
                    const storedToken = localStorage.getItem("googleAuthToken");
                    if (storedToken) {
                        gapi.auth.setToken(JSON.parse(storedToken));
                        gapi.client.setToken(JSON.parse(storedToken));
                    }

                    const authInstance = gapi.auth2.getAuthInstance();
                    const isSignedIn = await authInstance.isSignedIn.get();
                    const title = "EcommerceSpreadSheet";

                    console.log("Before if (isSignedIn) { This is supposed to house the authData");
                    if (isSignedIn) {
                        // console.log({initSheetSchema})
                        const googleDrive = new GoogleDriveAPI(gapi);
                        const googleSheet = new GoogleSheetsAPI(gapi);
                        const driveRes = await googleDrive.createFolderIfNotExists("EcommerceWebsite");
                        initSheetSchema.push(settingsSchema())
                        const sheetRes = await googleSheet.createSpreadsheetWithSheetsAndHeaders(title, initSheetSchema);
                        const authData = await googleSheet.getRowByIndexByName("EcommerceSpreadSheet", "Auth", 2);
                        console.log("After if (isSignedIn) { This is supposed to house the authData");

                        console.log("This is supposed to house the authData");
                        // Check google spreadsheet if google refresh token exist
                        if (authData) {
                            console.log({ authData })
                            if (authData.googleRefreshToken) { // if google refresh token exist
                                const id_token = gapi.auth.getToken().id_token;
                                const googleUserId = authData.googleUserId;
                                const userId = getUserIdFromIdToken(id_token);
                                localStorage.setItem("auth", JSON.stringify(authData));
                                // console.log("googleUserId === userId",(googleUserId === userId))
                                // Check if google userId matches spreadsheet userId
                                if (googleUserId !== userId) {
                                    gapi.auth2.getAuthInstance().signOut();
                                    localStorage.clear();
                                    localStorage.setItem('logged-in', 'false');
                                    navigate("/auth");
                                } else if (googleUserId === userId) {
                                    // Check if logged in meta tokens is equal to spreadsheet meta tokens
                                    // if false update Auth sheet with new meta tokens
                                    // clear userIds and meta auth tokens from localstorage (do same with google drive)
                                }
                            }
                        } else if (!authData) {
                            console.log("else if (!authData) {")
                            // Means the user is a new user
                            // If so we need to create a refresh token for the new user
                            // logoutuser
                            let facebookAuthData = localStorage.getItem("facebookAuthToken");
                            gapi.auth2.getAuthInstance().signOut()
                            localStorage.clear();
                            // localStorage.setItem("googleAuthCallbackActivated", "true");
                            const { cancel, promise } = cancellableWaiting(3000);
                            await promise;
                            localStorage.setItem("facebookAuthToken", facebookAuthData);
                            // redirect to authenticate page by getting code
                            const url = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/drive%20https://www.googleapis.com/auth/spreadsheets%20https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile&access_type=offline&prompt=consent
                            `;
                            const link = document.createElement("a");
                            link.href = url;
                            document.body.appendChild(link);
                            cancel();
                            link.click();
                            document.body.removeChild(link);
                        }

                        await googleSheet.updateHeadersByName(title, initSheetSchema);
                        // console.log({ driveRes, sheetRes })
                        await loadSettings(gapi);
                        if (isSignedIn) {
                            localStorage.setItem('logged-in', 'true');
                        } else if (!isSignedIn) {
                            localStorage.setItem("logged-in", "false");
                        }

                        console.log("Navigate to home page");
                        window.location.href = "/";
                    }
                } catch (e) {
                    console.log(e);
                }
            })
            .catch((error) => {
                console.error("Error during sign-in:", error);
                setGoogleIsLoading(false);
                cancel();
            });
    }

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-2 sm:p-4">
            <button
                ref={googleButtonRef}
                onClick={handleGoogleLogin}
                disabled={googleIsLoading}
                className="btn btn-md sm:btn-lg w-full btn-info hover:bg-info/10 hover:text-base-content"
            >
                {googleIsLoading ? (
                    <span className="loading loading-spinner"></span>
                ) : (
                    <>
                        <span className="text-xs sm:text-base">Continue with Google</span>
                    </>
                )}
            </button>
        </div>
    );
}

export default FacebookCallback;