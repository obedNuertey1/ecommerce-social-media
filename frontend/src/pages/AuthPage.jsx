import { FacebookIcon, ShieldCheckIcon, KeyIcon} from "lucide-react";
import { useState } from "react";
import { LoginSocialFacebook, LoginSocialGoogle } from "reactjs-social-login";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";
import {Link} from "react-router-dom";
import { useGoogleAuthContext } from "../contexts/GoogleAuthContext.jsx";

// Configuration 1
const CLIENT_ID = "384372585523-uckdjngronpg7it0m1udkvqget6d8a70.apps.googleusercontent.com";
const API_KEY = "AIzaSyBkhdhK-GMELzebWxjVof_8iW8lUdfYza4";
const CLIENT_SECRET = "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";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [passkey, setPasskey] = useState("");
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { facebook_authenticate, passkey_authenticate } = useAuthStore();
  const { gapi } = useGoogleAuthContext();

  const handleFacebookLogin = () => {
    if (!acceptedTerms) {
      toast.error("You must accept the terms to continue");
      return;
    }
    setIsLoading(true);
    // Existing Facebook logic
  };

  const listFiles = () => {
    const accessToken = gapi.auth.getToken().access_token;
    console.log({ accessToken });
    fetch("https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType)", {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Failed to fetch files from google drive");
        }
        return response.json();
    })
        .then((data) => {
            console.log(data);
            // setFiles(data?.files);
        })
}
  const handleGoogleLogin = (response) => {
    localStorage.setItem('logged-in', 'true');
    setIsAuthenticated(true)
    gapi.auth2.getAuthInstance().signIn()
    listFiles()
    localStorage.setItem("logged-in", "true")
    console.log(response);
  }

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
            <LoginSocialFacebook appId="YOUR_APP_ID" onResolve={facebook_authenticate}>
              <button
                onClick={handleFacebookLogin}
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
            <LoginSocialGoogle client_id={CLIENT_ID} onResolve={handleGoogleLogin}>
              <button
                // onClick={handleFacebookLogin}
                disabled={isLoading || !acceptedTerms}
                className="btn btn-md sm:btn-lg w-full btn-info hover:bg-info/10 hover:text-base-content"
              >
                {/* bg-[#1877F2] hover:bg-[#166FE5] text-white */}
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <>
                    <FacebookIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-base">Continue with Google</span>
                  </>
                )}
              </button>
            </LoginSocialGoogle>

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