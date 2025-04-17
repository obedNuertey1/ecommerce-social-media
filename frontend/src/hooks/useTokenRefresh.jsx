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


// import { useQuery } from '@tanstack/react-query';
// import { useEffect } from 'react';
// import { gapi } from 'gapi-script';

// function useTokenRefresh() {
//     const { refetch } = useQuery({
//         queryKey: ['google-auth-token'],
//         queryFn: async () => {
//             try {
//                 const authInstance = gapi.auth2.getAuthInstance();
//                 const currentUser = authInstance.currentUser.get();
//                 const newAuthResponse = await currentUser.reloadAuthResponse();

//                 // Update storage and client
//                 gapi.auth.setToken(newAuthResponse);
//                 gapi.client.setToken(newAuthResponse);

//                 return newAuthResponse;
//             } catch (error) {
//                 console.error("Token refresh failed:", error);
//                 throw error;
//             }
//         },
//         enabled: !!localStorage.getItem("googleAuthToken"),
//         refetchInterval: 50 * 60 * 1000, // 50 minutes
//         refetchOnWindowFocus: true,
//         refetchIntervalInBackground: true,
//         retry: 3,
//         retryDelay: (attempt) => Math.min(attempt * 1000, 30 * 1000),
//         staleTime: 45 * 60 * 1000, // 45 minutes
//     });

//     // Initial refresh on mount
//     useEffect(() => {
//         if (localStorage.getItem("googleAuthToken")) {
//             refetch();
//         }
//     }, [refetch]);

//     return { refetch };
// }

// export default useTokenRefresh;

// import { useQuery } from '@tanstack/react-query';
// import { gapi } from 'gapi-script';

// function useTokenRefresh() {

//     const { refetch } = useQuery({
//         queryKey: ['google-auth-token'],
//         queryFn: async () => {
//             const token = JSON.parse(localStorage.getItem("googleAuthToken") || 'null');

//             // Early exit for expired sessions
//             if (token && Date.now() > token.expires_at) {
//                 throw new Error('Token already expired');
//             }

//             try {
//                 const authInstance = gapi.auth2.getAuthInstance();
//                 const currentUser = authInstance.currentUser.get();
//                 const newAuthResponse = await currentUser.reloadAuthResponse();

//                 localStorage.setItem("googleAuthToken", JSON.stringify({
//                     ...newAuthResponse,
//                     expires_at: Date.now() + (newAuthResponse.expires_in * 1000)
//                 }));

//                 gapi.auth.setToken(newAuthResponse);
//                 gapi.client.setToken(newAuthResponse);

//                 return newAuthResponse;
//             } catch (error) {
//                 throw error;
//             }
//         },
//         enabled: !!localStorage.getItem("googleAuthToken"),
//         refetchInterval: (query) =>
//             query.state.data?.expires_in
//                 ? (query.state.data.expires_in - 300) * 1000 // 5min buffer
//                 : 50 * 60 * 1000,
//         refetchOnWindowFocus: true,
//         retry: (failureCount, error) =>
//             error.message !== 'Token already expired' && failureCount < 2,
//         staleTime: (data) =>
//             data ? (data.expires_in - 600) * 1000 : 45 * 60 * 1000 // 10min buffer
//     });

//     return { refetch };
// }

// export default useTokenRefresh;