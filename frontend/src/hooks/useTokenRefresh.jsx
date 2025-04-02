import { useEffect } from 'react';
import { gapi } from 'gapi-script';

function useTokenRefresh() {
    useEffect(() => {
        // Define an async function to refresh the token.
        const storedToken = localStorage.getItem("googleAuthToken");
        if(storedToken){
            async function refreshToken() {
                try {
                    const authInstance = gapi.auth2.getAuthInstance();
                    const currentUser = authInstance.currentUser.get();
                    // Reload the auth response, which fetches a new token.
                    const newAuthResponse = await currentUser.reloadAuthResponse();
                    // Update localStorage with the new token data.
                    localStorage.setItem("googleAuthToken", JSON.stringify(newAuthResponse));
                    // Optionally, update the gapi client if needed:
                    gapi.auth.setToken(newAuthResponse);
                    gapi.client.setToken(newAuthResponse);
                    console.log("Token refreshed and stored:", newAuthResponse);
                } catch (error) {
                    console.error("Error refreshing token:", error);
                }
            }
    
            // Determine an appropriate interval.
            // For example, if your token expires in 3600 seconds (1 hour),
            // you might refresh every 50 minutes (50 * 60 * 1000 ms).
            const refreshInterval = 50 * 60 * 1000;
            // const refreshInterval = 0.1 * 60 * 1000;
            const intervalId = setInterval(refreshToken, refreshInterval);
    
            // Optionally, call refreshToken once immediately on mount.
            refreshToken();
    
            // Clean up the interval on unmount.
            return () => clearInterval(intervalId);
        }

    }, []);
}

export default useTokenRefresh;
