import React, { useEffect, useRef } from 'react';
import { useGoogleAuthContext } from '../contexts/GoogleAuthContext';
import useQuery from '../hooks/useQuery';
import { useNavigate } from "react-router-dom";
import { encryptData, getUserIdFromIdToken } from "../funcs/essentialFuncs"
import { schemas } from "../schemas/initSheetSchema";
import { GoogleSheetsAPI } from '../lib/googleLibs';
import { cancellableWaiting } from "../funcs/waiting";
import { useSettingsStore } from '../store/useSettingsStore';

const AuthSchema = schemas.find((elem) => elem.sheetName === "Auth");

// Configuration temporary
const ORIGIN = window.location.origin;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${ORIGIN}${import.meta.env.VITE_GOOGLE_REDIRECT_URI}`;
const ENCRYPT_DECRYPT_KEY = import.meta.env.VITE_ENCRYPT_DECRYPT_KEY;
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = import.meta.env.VITE_FACEBOOK_APP_SECRET;
const GOOGLE_SPREADSHEET_NAME = import.meta.env.VITE_GOOGLE_SPREADSHEET_NAME;


async function exchangeFacebookToken(appId, appSecret, shortLivedToken) {
    
    const params = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortLivedToken,
    });

    try {
        const response = await fetch(
            `https://graph.facebook.com/v11.0/oauth/access_token?${params.toString()}`,
            { method: 'GET' }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // console.log('Long-lived token data:', data);
        return data;
    } catch (error) {
        console.error('Error exchanging token:', error);
        throw error;
    }
}

function GoogleAuthCallback() {
    const navigate = useNavigate();
    const { gapi } = useGoogleAuthContext();
    const query = useQuery();
    const { loadSettings } = useSettingsStore();
    // get code
    const code = query.get("code");
    const runOnceRef = useRef(false);
    // console.log({ code })
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
                .then(response => {
                    // console.log({response});
                    return response.json();
                })
                .then(async (result) => {
                    try {
                        // const {promise, cancel} = cancellableWaiting(2000);
                        // console.log({ result });
                        const spreadsheetName = GOOGLE_SPREADSHEET_NAME;
                        const userId = getUserIdFromIdToken(result.id_token);
                        // this.gapi.auth.getToken().access_token
                        const gapi2 = {
                            auth: {
                                getToken() {
                                    return result;
                                }
                            }
                        }
                        // console.log({gapi2});
                        // Set tokens to authenticate user
                        gapi.auth.setToken(result);
                        // gapi.auth2.getAuthInstance().setAccessToken(result.access_token);
                        gapi.client.setToken(result);
                        // localStorage.setItem("rft", result.refresh_token);
                        // Encrypt google refresh token
                        const googleRefreshToken = await encryptData(result.refresh_token, ENCRYPT_DECRYPT_KEY);
                        // Encrypt meta refresh and access tokens
                        const googleSheet = new GoogleSheetsAPI(gapi2);
                        const facebookAuthData = JSON.parse(localStorage.getItem("facebookAuthToken"));
                        // console.log({facebookAuthData});
                        const longLivedFBTokenData = {};
                        if (facebookAuthData) {
                            const facebookAccessToken = facebookAuthData.accessToken
                            const longLivedTokenData = await exchangeFacebookToken(FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, facebookAccessToken);
                            longLivedFBTokenData["facebookLongLivedAccessToken"] = await encryptData(longLivedTokenData.access_token, ENCRYPT_DECRYPT_KEY);
                            longLivedFBTokenData["facebookLongLivedAccessTokenExpires"] = longLivedTokenData.expires_in;
                            longLivedFBTokenData["facebookUserId"] = facebookAuthData.userID;
                            // console.log({longLivedTokenData, facebookAccessToken})
                        }
                        
                        const authObj = {
                            googleUserId: userId,
                            googleRefreshToken: googleRefreshToken, // encrypted
                            googleRefreshTokenExpires: result.refresh_token_expires_in,
                            facebookUserId: longLivedFBTokenData.facebookUserId,
                            facebookLongLivedAccessToken: longLivedFBTokenData.facebookLongLivedAccessToken, // encrypted
                            facebookLongLivedAccessTokenExpires: longLivedFBTokenData.facebookLongLivedAccessTokenExpires,
                            threadsUserId: null,
                            threadsLongLivedAccessToken: null,
                            threadsLongLivedAccessTokenExpires: null,
                            instagramUserId: null,
                            instagramLongLivedAccessToken: null,
                            instagramLongLivedAccessTokenExpires: null,
                            businessProfileId: null
                        }

                        await googleSheet.appendRowInPage(GOOGLE_SPREADSHEET_NAME, AuthSchema.sheetName, authObj, AuthSchema.shape);
                        // console.log({ result })
                        // Authenticate user and redirect to homepage (if given the right privilege)
                        // localStorage.clear();
                        localStorage.setItem("googleAuthToken", JSON.stringify(result));
                        localStorage.removeItem("facebookAuthToken");
                        localStorage.setItem("logged-in", JSON.stringify(true));
                        localStorage.setItem("auth", JSON.stringify(authObj));
                        await loadSettings(gapi2);
                        window.location.href = "/";
                    } catch (e) {
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