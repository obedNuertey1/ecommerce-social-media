import { FacebookIcon ,ShieldCheckIcon, FolderArchiveIcon } from "lucide-react";
import { useState } from "react";
import {LoginSocialFacebook} from "reactjs-social-login";
import { useAuthStore } from "../store/useAuthStore";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const {facebook_authenticate} = useAuthStore();

  const handleFacebookLogin = () => {
    setIsLoading(true);
    // Add your Facebook authentication logic here
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-base-200 rounded-2xl shadow-xl p-8 transition-all duration-300">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo & Heading */}
          <div className="text-center space-y-4">
            <div className="bg-primary/10 p-4 rounded-full animate-pulse">
              <FacebookIcon className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-base-content">
              Welcome Back
            </h1>
            <p className="text-base-content/70">
              Connect with your Facebook account to continue
            </p>
          </div>

          {/* Facebook Login Button */}
          <LoginSocialFacebook
            appId="YOUR_APP_ID"
            onResolve={facebook_authenticate}
          >
            <button
              onClick={handleFacebookLogin}
              disabled={isLoading}
              className="py-2 btn btn-lg w-full bg-[#1877F2] hover:bg-[#166FE5] text-white transition-all flex-nowrap text-nowrap"
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <FacebookIcon className="w-6 h-6" />
                  <span>Continue with Facebook</span>
                </>
              )}
            </button>
          </LoginSocialFacebook>
             {/* <button
            onClick={handleFacebookLogin}
            disabled={isLoading}
            style={{ touchAction: "manipulation" }}
            className="py-2 btn btn-lg w-full bg-[#1877F2] hover:bg-[#166FE5] text-white transition-all active:scale-95 focus:outline-none"
          >
            {isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <>
                <FacebookIcon className="w-6 h-6" />
                <span className="ml-2">Continue with Facebook</span>
              </>
            )}
          </button> */}

          {/* Terms & Privacy */}
          <div className="text-center text-sm text-base-content/60 flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>
              By continuing, you agree to our{" "}
              <a href="#" className="link link-hover text-primary">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="link link-hover text-primary">
                Privacy Policy
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}