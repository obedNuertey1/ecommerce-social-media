import {create} from "zustand";

export const useAuthStore = create((set, get)=>({
    loading: false,
    error: null,
    auth_data: {
        facebook_access_token: localStorage.getItem("facebook_access_token"),
        facebook_user_id: localStorage.getItem("facebook_user_id") ,
        instagram_access_token: localStorage.getItem("instagram_access_token"),
        instagram_user_id: localStorage.getItem("instagram_user_id"),
        threads_access_token: localStorage.getItem("threads_access_token"),
        threads_user_id: localStorage.getItem("threads_user_id") 
    },
    setAuthData: (auth_data)=>{
        localStorage.setItem("facebook_access_token", auth_data.facebook_access_token)
        localStorage.setItem("facebook_user_id", auth_data.facebook_user_id)
        localStorage.setItem("instagram_access_token", auth_data.instagram_access_token)
        localStorage.setItem("instagram_user_id", auth_data.instagram_user_id)
        localStorage.setItem("threads_access_token", auth_data.threads_access_token)
        localStorage.setItem("threads_user_id", auth_data.threads_user_id)
        set({auth_data})
    },
    clearAuthData: ()=>{
        localStorage.removeItem("facebook_access_token")
        localStorage.removeItem("facebook_user_id")
        localStorage.removeItem("instagram_access_token")
        localStorage.removeItem("instagram_user_id")
        localStorage.removeItem("threads_access_token")
        localStorage.removeItem("threads_user_id")
        set({
            auth_data: {
                facebook_access_token: null,
                facebook_user_id: null,
                instagram_access_token: null,
                instagram_user_id: null,
                threads_access_token: null,
                threads_user_id: null
            }
        })
    },
    instagram_authenticate: (response)=>{
        loading(true);
        try{
            const {access_token, user_id} = response;
            setAuthData({...get().auth_data, instagram_access_token: access_token, instagram_user_id: user_id})
        }catch(e){
            set({error: "Something went wrong. Please try again later."})
        }finally{
            set({error: null, loading: false})
        }
    },
    facebook_authenticate: (response)=>{
        loading(true);
        try{
            const {access_token, user_id} = response;
            setAuthData({...get().auth_data, facebook_access_token: access_token, facebook_user_id: user_id})
        }catch(e){
            set({error: "Something went wrong. Please try again later."})
        }finally{
            set({error: null, loading: false})
        }
    },
    threads_authenticate: (response)=>{
        loading(true);
        try{
            const {access_token, user_id} = response;
            setAuthData({...get().auth_data, threads_access_token: access_token, threads_user_id: user_id})
        }catch(e){
            set({error: "Something went wrong. Please try again later."})
        }finally{
            set({error: null, loading: false})
        }
    }
}))