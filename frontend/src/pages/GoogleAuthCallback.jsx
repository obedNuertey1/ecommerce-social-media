import React, { useEffect, useRef } from 'react';
import { useGoogleAuthContext } from '../contexts/GoogleAuthContext';
import useQuery from '../hooks/useQuery';
import {useNavigate} from "react-router-dom";
import {encryptData, getUserIdFromIdToken} from "../funcs/essentialFuncs"
import {schemas} from "../schemas/initSheetSchema";
import { GoogleSheetsAPI } from '../lib/googleLibs';
import { cancellableWaiting } from "../funcs/waiting";

const AuthSchema = schemas.find((elem)=>elem.sheetName === "Auth");

// Configuration temporary
const CLIENT_ID = "735897969269-0nhfejn5pre40a511kvcprm6551bon5n.apps.googleusercontent.com";
const API_KEY = "AIzaSyBkhdhK-GMELzebWxjVof_8iW8lUdfYza4";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:5173/google/auth/callback/";
const ENCRYPT_DECRYPT_KEY = "elephantTusk";

function GoogleAuthCallback() {
    const navigate = useNavigate();
    const { gapi } = useGoogleAuthContext();
    const query = useQuery();
    // get code
    const code = query.get("code");
    const runOnceRef = useRef(false);
    console.log({code})
    useEffect(() => {
        const getRefreshToken = async () => {
            if (runOnceRef.current) return;
            runOnceRef.current = true;
            const data = new URLSearchParams();
            data.append("code", code);
            data.append("client_id", CLIENT_ID);
            data.append("client_secret", CLIENT_SECRET);
            data.append("redirect_uri", REDIRECT_URI);
            data.append("grant_type", "authorization_code");
            
            fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: data.toString()
            })
                .then(response => response.json())
                .then(async (result) => {
                    try{
                        const {promise, cancel} = cancellableWaiting(2000);
                        console.log({result});
                        localStorage.setItem("googleAuthToken", JSON.stringify(result));
                        const spreadsheetName = "EcommerceSpreadSheet";
                        const userId = getUserIdFromIdToken(result.id_token);
                        // this.gapi.auth.getToken().access_token
                        const gapi2 = {
                            auth: {
                                getToken(){
                                    return result;
                                }
                            }
                        }
                        // Set tokens to authenticate user
                        gapi.auth.setToken(result);
                        // gapi.auth2.getAuthInstance().setAccessToken(result.access_token);
                        gapi.client.setToken(result);
                        // localStorage.setItem("rft", result.refresh_token);
                        // Encrypt google refresh token
                        const googleRefreshToken = await encryptData(result.refresh_token, ENCRYPT_DECRYPT_KEY);
                        // Encrypt meta refresh and access tokens
                        const googleSheet = new GoogleSheetsAPI(gapi2);
                        // await spreadsheet.postOneRowPage(spreadsheetName, {
                        //     googleUserId: userId,
                        //     googleAccessToken: null,
                        //     googleRefreshToken: googleRefreshToken,
                        //     facebookUserId: null,
                        //     facebookAccessToken: null,
                        //     facebookRefreshToken: null,
                        //     threadsUserId: null,
                        //     threadsAccessToken: null,
                        //     threadsRefreshToken: null,
                        //     instagramUserId: null,
                        //     instagramAccessToken: null,
                        //     instagramRefreshToken: null,
                        //     businessProfileId: null
                        // }, AuthSchema.shape, 2, AuthSchema.sheetName);

                        await googleSheet.appendRowInPage("EcommerceSpreadSheet", AuthSchema.sheetName, {
                            googleUserId: userId,
                            googleAccessToken: null,
                            googleRefreshToken: googleRefreshToken,
                            facebookUserId: null,
                            facebookAccessToken: null,
                            facebookRefreshToken: null,
                            threadsUserId: null,
                            threadsAccessToken: null,
                            threadsRefreshToken: null,
                            instagramUserId: null,
                            instagramAccessToken: null,
                            instagramRefreshToken: null,
                            businessProfileId: null
                        }, AuthSchema.shape);
                        console.log({result})

                        // clear userIds and meta auth tokens from localStorage (do same with google auth tokens and userId)
                        await promise;
                        localStorage.setItem("fb_refresh_token", "");
                        localStorage.setItem("inst_refresh_token", "");
                        localStorage.setItem("th_refresh_token", "");
                        localStorage.setItem("fb_access_token", "")
                        localStorage.setItem("inst_access_token", "")
                        localStorage.setItem("th_access_token", "")
                        // Authenticate user and redirect to homepage (if given the right privilege)
                        cancel();
                        navigate("/");
                    }catch(e){
                        console.log(e);
                        throw new Error(e);
                    }
                })
                .catch(error => console.error("Error:", error));
        };
        getRefreshToken();
    }, [code]);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <h1 className="text-">Google Auth Callback</h1>
        </div>
    )
}

export default GoogleAuthCallback;