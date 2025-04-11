import {create} from "zustand";
import {toast} from "react-hot-toast";
import axios from "axios";
// import { waiting } from "../hooks/waiting";
import {cancellableWaiting, waiting} from "../funcs/waiting";
import { GoogleSheetsAPI } from "../lib/googleLibs";

const GOOGLE_SPREADSHEET_NAME = import.meta.env.VITE_GOOGLE_SPREADSHEET_NAME;

export const useSettingsStore = create((set, get)=>({
    loading: false,
    error: null,
    location: {
        manualAddress: "",
        timestamp: null,
        error: null,
        loading: false
    },
    handleGetLocation: async ()=>{
        if(!navigator.geolocation){
            set({location: {...get().location, error: "Geolocation is not supported by your browser."}, loading: false})
            toast.error("Geolocation is not supported by your browser.");
            return;
        }
        set((prev)=>({location: {...prev.location, loading: true, error: null}}));
        await waiting(1000);
        try{
            navigator.geolocation.getCurrentPosition(async (position)=>{
                    const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`);
                    set((prev)=>({
                        settings: {...prev.settings, address: {
                            ...prev.settings.address,
                            display_name: String(res.data.display_name).split(",").join("\n"),
                            country: res.data.address.country,
                            country_code: res.data.address.country_code,
                            timestamp: position.timestamp
                        }
                    }
                    }
                    ))
            },
            (error)=>{
                set(prev=>({location: {
                    ...prev.location,
                    error: error.message
                }}));
                toast.error(error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        )
        }catch(e){
            console.log("An error occurred while getting the location:", e);
            set(prev=>({location: {...prev.location, error: e.message}}));
            toast.error("An error occurred while getting the location.");
        }finally{
            set(prev=>({location: {...prev.location, loading: false}}));
        }
    },
    settings: {
        address: {
            display_name: "",
            country: "",
            country_code: "",
            timestamp: null,
            manualAddress: ""
        },
        autoPost: {
            instagram: true,
            facebook: true,
            threads: false
        },
        repostingRules: {
            interactionThreshold: 0,
            checkFrequency: "1" // 1 for every 24 hours 2 for every 48 hours and 7 for every week
        },
        aiConfigurations:{
            productDescriptions: {
                enableAiDescriptions: true,
                descriptionStyle: "casual", // description styles (creative, technical, casual)
            },
            socialMediaReplies: "manual", // manual, ai-only, hybrid
            aiModelSelection: {
                model: "models/gemini-2.0-flash",
                /**
                 * AI models:
                 * "models/gemini-2.0-flash", "models/gemini-2.0-flash-lite-preview-02-05", "models/gemini-1.5-flash", "models/gemini-1.5-flash-8b", "models/gemini-1.5-pro"
                 */
            },
            reportsGeneration:{
                automaticPdfReports: true,
                reportFrequency: "30", // 1=daily, 7=weekly, 30=monthly
                email: ""
            }
        },
        visualCustomization: {
            themeSelection: {
                theme: localStorage.getItem("preferred-theme") || "forest"
            },
            productAiSettings: {
                enableVirtualTryOnGeneration: true,
                modelDiversity: 'multiracial', /**      "Multiracial",
                "White",
                "Black or African American",
                "Asian",
                "American Indian or Alaska Native",
                "Native Hawaiian or Other Pacific Islander",
                "Hispanic or Latino" */
                numberOfPoses: 4,
                skinToneVariation: 1,
                productType: "clothing"
            }
        },
        notifications: {
            mute: false,
            volume: 100, // 0-100
        }
    },
    resetToDefault: {
        address: {
            display_name: "",
            country: "",
            country_code: "",
            timestamp: null,
            manualAddress: ""
        },
        autoPost: {
            instagram: true,
            facebook: true,
            threads: false
        },
        repostingRules: {
            interactionThreshold: 0,
            checkFrequency: "1" // 1 for every 24 hours 2 for every 48 hours and 7 for every week
        },
        aiConfigurations:{
            productDescriptions: {
                enableAiDescriptions: true,
                descriptionStyle: "casual", // description styles (creative, technical, casual)
            },
            socialMediaReplies: "manual", // manual, ai-only, hybrid
            aiModelSelection: {
                model: "models/gemini-2.0-flash",
                /**
                 * AI models:
                 * "models/gemini-2.0-flash", "models/gemini-2.0-flash-lite-preview-02-05", "models/gemini-1.5-flash", "models/gemini-1.5-flash-8b", "models/gemini-1.5-pro"
                 */
            },
            reportsGeneration:{
                automaticPdfReports: true,
                reportFrequency: "30", // 1=daily, 7=weekly, 30=monthly
                email: ""
            }
        },
        visualCustomization: {
            themeSelection: {
                theme: localStorage.getItem("preferred-theme") || "forest"
            },
            productAiSettings: {
                enableVirtualTryOnGeneration: true,
                modelDiversity: 'multiracial', /**      "Multiracial",
                "White",
                "Black or African American",
                "Asian",
                "American Indian or Alaska Native",
                "Native Hawaiian or Other Pacific Islander",
                "Hispanic or Latino" */
                numberOfPoses: 4,
                skinToneVariation: 1,
                productType: "clothing"
            }
        },
        notifications: {
            mute: false,
            volume: 100, // 0-100
        }
    },
    setSettings : (settings)=>(set({settings})),
    settingsSchema : ()=>({sheetName: "Settings", shape: Object.keys(get().settings)}),
    saveSettings: async (gapi)=>{
        set({loading: true});
        try{
            const spreadsheetName = GOOGLE_SPREADSHEET_NAME;
            const schema = get().settingsSchema().shape;
            const {settings} = get();
            const spreadsheet = new GoogleSheetsAPI(gapi);
            await spreadsheet.postOneRowPage(spreadsheetName, settings, schema, 2)
            toast.success("Settings saved successfully");
            set({error: null})
        }catch(e){
            console.log(`Error saving settings: ${e}`);
            toast.error("Something went wrong");
            set({error: "Something went wrong"});
        }finally{
            set({loading: false});
        }
    },
    restoreDefaultSettings: async (gapi)=>{
        set({loading: true});
        try{
            const spreadsheetName = GOOGLE_SPREADSHEET_NAME;
            const schema = get().settingsSchema().shape;
            const {resetToDefault} = get();
            const spreadsheet = new GoogleSheetsAPI(gapi);
            await spreadsheet.postOneRowPage(spreadsheetName, resetToDefault, schema, 2)
            toast.success("Default settings restored successfully");
            set(prev => ({...prev, settings: resetToDefault, error:null}));
        }catch(e){
            console.log(`Error restoring default settings: ${e}`);
            toast.error("Something went wrong");
        }finally{
            set({loading: false});
        }
    },
    loadSettings: async (gapi)=>{
        set({loading: true});
        try{
            const spreadsheetName = GOOGLE_SPREADSHEET_NAME;
            const spreadsheet = new GoogleSheetsAPI(gapi);
            const settings = await spreadsheet.getSettingsFronSpreadsheetByName(spreadsheetName);
            set({settings, error:null});
            localStorage.setItem("preferred-theme", settings.visualCustomization.themeSelection.theme);
            // console.log("Settings loaded:", settings);
        }catch(e){
            console.log("Error loading settings:", e);
        }finally{
            set({loading: false});
        }
    }
}))