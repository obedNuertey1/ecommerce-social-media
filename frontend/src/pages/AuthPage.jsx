import { FacebookIcon, ShieldCheckIcon, KeyIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { LoginSocialFacebook, LoginSocialGoogle } from "reactjs-social-login";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useGoogleAuthContext } from "../contexts/GoogleAuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { GoogleDriveAPI, GoogleSheetsAPI } from "../lib/googleLibs";
import { getUserIdFromIdToken } from "../funcs/essentialFuncs";
import { cancellableWaiting } from "../funcs/waiting";
import { useSettingsStore } from "../store/useSettingsStore.js";
import { schemas as initSheetSchema } from "../schemas/initSheetSchema";

// Configuration 1
// const CLIENT_ID = "384372585523-uckdjngronpg7it0m1udkvqget6d8a70.apps.googleusercontent.com";
// const API_KEY = "AIzaSyBkhdhK-GMELzebWxjVof_8iW8lUdfYza4";
// const CLIENT_SECRET = "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";

// Configuration temporary
const CLIENT_ID = "735897969269-0nhfejn5pre40a511kvcprm6551bon5n.apps.googleusercontent.com";
const API_KEY = "AIzaSyBkhdhK-GMELzebWxjVof_8iW8lUdfYza4";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:5173/google/auth/callback/";
const FACEBOOK_APP_ID = "827316916277859";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { facebook_authenticate, passkey_authenticate } = useAuthStore();
  const { gapi } = useGoogleAuthContext();
  const { loadSettings, settingsSchema } = useSettingsStore();
  const navigate = useNavigate();

  const handleFacebookLogin = (response) => {
    setIsLoading(true);
    console.log({response})
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

  const [googleIsLoading, setGoogleIsLoading] = useState(false);
  useEffect(() => {
    return () => {
      setGoogleIsLoading(false);
    }
  }, []);
  // const handleGoogleLogin = () => {
  //   setGoogleIsLoading(true);
  //   gapi.auth2.getAuthInstance().signIn()
  //     .then(async (googleUser) => {
  //       // Access basic profile information
  //       const profile = googleUser.getBasicProfile();
  //       console.log("ID: " + profile.getId());
  //       console.log("Name: " + profile.getName());
  //       console.log("Image URL: " + profile.getImageUrl());
  //       console.log("Email: " + profile.getEmail());
  //       console.log("gapi.auth.getToken()=", gapi.auth.getToken());

  //       // You can also access the auth response, which includes the access token.
  //       const authResponse = googleUser.getAuthResponse();
  //       console.log("Access Token: ", authResponse.access_token);
  //       try {
  //         const storedToken = localStorage.getItem("googleAuthToken");
  //         if (storedToken) {
  //           gapi.auth.setToken(JSON.parse(storedToken));
  //           gapi.client.setToken(JSON.parse(storedToken));
  //         }

  //         const authInstance = gapi.auth2.getAuthInstance();
  //         const isSignedIn = await authInstance.isSignedIn.get();
  //         const title = "EcommerceSpreadSheet";

  //         console.log("Before if (isSignedIn) { This is supposed to house the authData");
  //         if (isSignedIn) {
  //           // console.log({initSheetSchema})
  //           const googleDrive = new GoogleDriveAPI(gapi);
  //           const googleSheet = new GoogleSheetsAPI(gapi);
  //           const driveRes = await googleDrive.createFolderIfNotExists("EcommerceWebsite");
  //           initSheetSchema.push(settingsSchema())
  //           const sheetRes = await googleSheet.createSpreadsheetWithSheetsAndHeaders(title, initSheetSchema);
  //           const authData = await googleSheet.getRowByIndexByName("EcommerceSpreadSheet", "Auth", 2);
  //           console.log("After if (isSignedIn) { This is supposed to house the authData");

  //           // Check google spreadsheet if google refresh token exist
  //           console.log("This is supposed to house the authData");
  //           if (authData) {
  //             console.log({ authData })
  //             if (authData.googleRefreshToken) {
  //               // console.log("This is authData:",{authData});
  //               const id_token = gapi.auth.getToken().id_token;
  //               const googleUserId = authData.googleUserId;
  //               const userId = getUserIdFromIdToken(id_token);
  //               // console.log("googleUserId === userId",(googleUserId === userId))
  //               // Check if google userId matches spreadsheet userId
  //               if (googleUserId !== userId) {
  //                 gapi.auth2.getAuthInstance().signOut();
  //                 localStorage.clear();
  //                 localStorage.setItem('logged-in', 'false');
  //                 navigate("/auth");
  //               } else if (googleUserId === userId) {
  //                 // Check if logged in meta tokens is equal to spreadsheet meta tokens
  //                 // if false update Auth sheet with new meta tokens
  //                 // clear userIds and meta auth tokens from localstorage (do same with google drive)
  //               }
  //             }
  //           } else if (!authData) {
  //             console.log("else if (!authData) {")
  //             // Means the user is a new user
  //             // If so we need to create a refresh token for the new user
  //             // logoutuser
  //             gapi.auth2.getAuthInstance().signOut()
  //             localStorage.clear();
  //             const { cancel, promise } = cancellableWaiting(3000);
  //             await promise;
  //             // redirect to authenticate page by getting code
  //             const url = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/drive%20https://www.googleapis.com/auth/spreadsheets%20https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile&access_type=offline&prompt=consent
  //               `;
  //             const link = document.createElement("a");
  //             link.href = url;
  //             document.body.appendChild(link);
  //             cancel();
  //             link.click();
  //             document.body.removeChild(link);
  //           }

  //           await googleSheet.updateHeadersByName(title, initSheetSchema);
  //           // console.log({ driveRes, sheetRes })
  //           await loadSettings(gapi);
  //           if (isSignedIn) {
  //             localStorage.setItem('logged-in', 'true');
  //           } else if (!isSignedIn) {
  //             localStorage.setItem("logged-in", "false");
  //           }

  //           console.log("Navigate to home page");
  //           window.location.href = "/";
  //         }
  //       } catch (e) {
  //         console.log(e);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error during sign-in:", error);
  //     });
  // }

  const handlePasskeyLogin = async (e) => {
    e.preventDefault();
    try {
      if (!acceptedTerms) {
        toast.error("You must accept the terms to continue");
        return;
      }

      setPasskeyLoading(true);

      if (!passkey.trim()) {
        toast.error("Please enter a valid passkey");
        return;
      }

      // Call your authentication endpoint
      const response = await passkey_authenticate(passkey);

      if (response.success) {
        toast.success("Access granted!");
        // Handle successful login (redirect, etc.)
      } else {
        toast.error("Invalid passkey");
      }
    } catch (error) {
      toast.error("Authentication failed");
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
            <LoginSocialFacebook appId={FACEBOOK_APP_ID} fields="name,email,picture" onResolve={handleFacebookLogin} onReject={()=>{
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
            {/* <LoginSocialGoogle client_id={CLIENT_ID} onResolve={(response) => {
              alert("Google login successful!");
              // handleGoogleLogin(response); // Call your handler if needed.
            }}
            onReject={(error)=>{
              alert("Google login failed!");
            }}
            > */}
            {/* <button
              onClick={handleGoogleLogin}
              disabled={googleIsLoading || !acceptedTerms}
              className="btn btn-md sm:btn-lg w-full btn-info hover:bg-info/10 hover:text-base-content"
            >
              {googleIsLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <FacebookIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-base">Continue with Google</span>
                </>
              )}
            </button> */}
            {/* </LoginSocialGoogle> */}
            {/* <a
              disabled={isLoading || !acceptedTerms}
              className="btn btn-md sm:btn-lg w-full btn-info hover:bg-info/10 hover:text-base-content"
              href={`https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/drive%20https://www.googleapis.com/auth/spreadsheets%20https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile&access_type=offline&prompt=consent
              `}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <FacebookIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-base">Continue with Google</span>
                </>
              )}
            </a> */}

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