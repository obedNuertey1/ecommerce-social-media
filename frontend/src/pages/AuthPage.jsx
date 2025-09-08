import { FacebookIcon, ShieldCheckIcon, KeyIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { LoginSocialFacebook, LoginSocialGoogle } from "reactjs-social-login";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useGoogleAuthContext } from "../contexts/GoogleAuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { GoogleDriveAPI, GoogleSheetsAPI } from "../lib/googleLibs";
import { getUserIdFromIdToken, decryptData, encryptData } from "../funcs/essentialFuncs";
import { cancellableWaiting } from "../funcs/waiting";
import { useSettingsStore } from "../store/useSettingsStore.js";
import { schemas as initSheetSchema } from "../schemas/initSheetSchema";
import { usePasskeyStore } from "../store/usePasskeyStore.js";
import { waiting } from "../funcs/waiting";

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
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = import.meta.env.VITE_FACEBOOK_APP_SECRET;
const ENCRYPT_DECRYPT_KEY = import.meta.env.VITE_ENCRYPT_DECRYPT_KEY;
const HASH_SPLIT_POINT = import.meta.env.VITE_HASH_SPLIT_POINT;


const passkeySchema = initSheetSchema.find((schema) => schema.sheetName === "Passkeys");

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { gapi } = useGoogleAuthContext();
  const { loadSettings, settingsSchema } = useSettingsStore();
  const { passkey: passkeyStoreData, updatePasskey, setPasskey:setPasskeyStoreData, resetPasskey, fetchPasskeys2 } = usePasskeyStore();
  const navigate = useNavigate();
  // renect version

  // const fbScopes = "pages_show_list,pages_manage_posts,pages_read_engagement,pages_read_user_content,instagram_basic,instagram_content_publish";
  // const fbScopes = "pages_show_list,pages_manage_posts,instagram_basic,instagram_content_publish,business_management";
  const fbScopes = "";

  const handleFacebookLogin = (response) => {
    setIsLoading(true);
    console.log({ response })
    localStorage.setItem("facebookResponse", JSON.stringify(response));
    if (!acceptedTerms) {
      toast.error("You must accept the terms to continue");
      setIsLoading(false);
      return;
    }
    localStorage.setItem("facebookAuthToken", JSON.stringify(response.data));

    setIsLoading(false);
    // Existing Facebook logic
    localStorage.setItem("facebookAuthCallbackActivated", "true");
    window.location.href = "/facebook/auth/callback/";
  };

  const handlePasskeyLogin = async (e) => {
    e.preventDefault();
    setPasskeyLoading(true);
    try {
      if (!acceptedTerms) {
        toast.error("You must accept the terms to continue");
        return;
      }

      if (!passkey.trim()) {
        toast.error("Please enter a valid passkey");
        return;
      }
      
      // 1. Validate passkey
      const encryptedRefreshToken = (passkey.split(HASH_SPLIT_POINT))[1];
      if(!encryptedRefreshToken){
        toast.error("Invalid passkey");
        return;
      }
      // Get decrypted refresh token 2. Decrypt passkey 3. Get encrypted google refresh token 4. Decrypt refresh token
      const REFRESH_TOKEN = await decryptData(encryptedRefreshToken, ENCRYPT_DECRYPT_KEY);
      const data = new URLSearchParams();
      data.append("client_id", CLIENT_ID);
      data.append("client_secret", CLIENT_SECRET);
      data.append("refresh_token", REFRESH_TOKEN);
      data.append("grant_type", "refresh_token");

      // 5. Exchange refresh token for access token
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: data.toString()
      })
      if(!response.status){
        toast.error("Passkey invalid");
        throw new Error("Error refreshing token");
      }
      const result = await response.json();
      const resultData = await result;
      const gapiData = {...resultData, refresh_token: REFRESH_TOKEN};
      const gapi2 = {
        auth: {
          getToken(){
            return gapiData;
          }
        }
      }

      const googleSheet = new GoogleSheetsAPI(gapi2);
      // const passkeys = await googleSheet.getSpreadsheetValuesByName2("EcommerceSpreadSheet", passkeySchema.sheetName);
      const passkeys = await fetchPasskeys2(gapi2);
      console.log("122 works")
      const passkeyFromSheet = passkeys.find((pk) => pk.passkey == passkey);
      console.log("124 works")


      const passkeyExist = Boolean(passkeyFromSheet);
      if(!passkeyExist){
        toast.error("Passkey invalid");
        gapi.auth2.getAuthInstance().signOut()
        throw new Error("Passkey invalid");
      }
      passkeyFromSheet.id = passkeyFromSheet.id;  // Add 2 to the id to make it start from 2 instead of 1 (id is 1 based)
      passkeyFromSheet.isOnline = "true";
      const passkeyToLocalStorage = JSON.stringify(passkeyFromSheet);
      const passkeyToLocalStorage2 = await encryptData(passkeyToLocalStorage, ENCRYPT_DECRYPT_KEY);
      
      passkeyFromSheet.accessiblePages = JSON.stringify(passkeyFromSheet.accessiblePages);
      passkeyFromSheet.privileges = JSON.stringify(passkeyFromSheet.privileges);
      setPasskeyStoreData(passkeyFromSheet);
      await updatePasskey(gapi2, passkeyFromSheet.id);
      

      const authData = await googleSheet.getRowByIndexByName("EcommerceSpreadSheet", "Auth", 2);

      gapi.auth.setToken(resultData);
      gapi.client.setToken(resultData);
      localStorage.setItem("googleAuthToken", JSON.stringify(resultData));
      localStorage.setItem("auth", JSON.stringify(authData));
      localStorage.setItem("logged-in", "true");
      localStorage.setItem("passkey", passkeyToLocalStorage2);
      localStorage.setItem("passkey_logs", JSON.stringify([]));
      localStorage.setItem("passkeyName", passkeyFromSheet.name);

      if(passkeyToLocalStorage2){
          const passkeyData = await decryptData(passkeyToLocalStorage2, ENCRYPT_DECRYPT_KEY);
          // setGetPasskey({...JSON.parse(passkeyData)});
          let {accessiblePages, privileges} = JSON.parse(passkeyData);
          localStorage.setItem("accessiblePages", JSON.stringify(accessiblePages));
          localStorage.setItem("privileges", JSON.stringify(privileges));
      }


      const pages = JSON.parse(passkeyToLocalStorage).accessiblePages;
      // console.log({pages});
      let url = "";
      if (pages.includes("products")) {
        url = "/";
      } else if (pages.includes("orders")) {
        url = "/orders";
      } else if (pages.includes("settings")) {
        url = "/settings";
      } else if (pages.includes("passkeys")) {
        url = "/passkey";
      } else if (pages.includes("passkey-logs")) {
        url = "/passkey/logs";
      } else {
        url = "/";
      }

      // const {cancel, promise} = cancellableWaiting(2000);
      // await promise;
      // cancel();
      // await waiting(5000);
      window.location.href = url;
    } catch (error) {
      toast.error("Authentication failed");
      console.error({error});
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md bg-base-200 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 transition-all duration-300 mx-2">
        <div className="flex flex-col items-center space-y-4 sm:space-y-6">
          {/* Logo & Heading */}
          <div className="text-center space-y-2 sm:space-y-4">
            <div className="bg-primary/10 p-2 sm:p-4 rounded-full animate-pulse">
              <span className="text-2xl sm:text-4xl text-primary font-bold font-mono">🔑</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-base-content">
              Admin Login
            </h1>
            <p className="text-sm sm:text-base text-base-content/70 px-2">
              Use secret passkey or Facebook
            </p>
          </div>
          {/* Terms & Privacy with Checkbox */}
          <div className="w-full text-xs sm:text-sm text-base-content/60">
            <label className="flex justify-center items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="checkbox checkbox-xs md:checkbox-sm checkbox-primary mt-0.5"
              />
              <div className="flex items-center gap-1 sm:gap-2">
                <ShieldCheckIcon className="size-3 hidden sm:flex sm:w-4 sm:h-4 flex-shrink-0" />
                <span>
                  I agree to the{" "}
                  <Link target="_blank" to="/info/terms-of-service" className="link link-hover text-primary">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link target="_blank" to="/info/privacy-policy" className="link link-hover text-primary">
                    Privacy Policy
                  </Link>
                </span>
              </div>
            </label>
          </div>
          {/* Login Options */}
          <div className="w-full space-y-3 sm:space-y-4">
            {/* Facebook Button */}
            <LoginSocialFacebook 
            appId={FACEBOOK_APP_ID} 
            fields="name,email,picture"
            version="v19.0"
            scope={fbScopes}
            onResolve={handleFacebookLogin} onReject={(e) => {
              console.log({e});
              toast.error("Facebook Login failed");
            }}>
              <button
                disabled={isLoading || !acceptedTerms}
                className="btn btn-md sm:btn-lg w-full btn-info hover:bg-info/10 hover:text-base-content"
              >
                {/* bg-[#1877F2] hover:bg-[#166FE5] text-white */}
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <>
                    <FacebookIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-base">Continue with Facebook</span>
                  </>
                )}
              </button>
            </LoginSocialFacebook>

            {/* Divider */}
            <div className="flex items-center gap-2 sm:gap-4 text-base-content/50 text-xs">
              <div className="flex-1 border-t"></div>
              <span>OR</span>
              <div className="flex-1 border-t"></div>
            </div>

            {/* Passkey Form */}
            <form onSubmit={handlePasskeyLogin} className="space-y-2 sm:space-y-4">
              <div className="form-control">
                <input
                  type="text"
                  placeholder="Secret Passkey"
                  className="input input-md input-bordered w-full"
                  value={passkey}
                  disabled={isLoading || !acceptedTerms}
                  onChange={(e) => setPasskey(e.target.value)}
                />
                <label className="label p-0 pt-1">
                  <span className="label-text-alt text-xs text-base-content/60">
                    Get passkey from admin
                  </span>
                </label>
              </div>
              <button
                type="submit"
                disabled={passkeyLoading || !acceptedTerms}
                className="btn btn-md sm:btn-lg w-full btn-primary hover:bg-primary/10 hover:text-base-content"
              >
                {passkeyLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <>
                    <KeyIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-base">Use Passkey</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}