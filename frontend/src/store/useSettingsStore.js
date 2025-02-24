import {create} from "zustand";
import {toast} from "react-hot-toast";

export const useSettingsStore = create((set, get)=>({
    loading: false,
    error: null,
    settings: {
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
                reportFrequency: "30" // 1=daily, 7=weekly, 30=monthly
            }
        },
        visualCustomization: {
            themeSelection: {
                theme: localStorage.getItem("preferred-theme") || "forest"
            },
            clothingAiSettings: {
                enableVirtualTryOnGeneration: true,
                modelDiversity: 'multiracial', /**      "Multiracial",
                "White",
                "Black or African American",
                "Asian",
                "American Indian or Alaska Native",
                "Native Hawaiian or Other Pacific Islander",
                "Hispanic or Latino" */
                numberOfPoses: 4,
                skinToneVariation: 1
            }
        },
    },
    resetToDefault: {
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
                reportFrequency: "30" // 1=daily, 7=weekly, 30=monthly
            }
        },
        visualCustomization: {
            themeSelection: {
                theme: "forest"
            },
            clothingAiSettings: {
                enableVirtualTryOnGeneration: true,
                modelDiversity: 'multiracial', /**      "Multiracial",
                "White",
                "Black or African American",
                "Asian",
                "American Indian or Alaska Native",
                "Native Hawaiian or Other Pacific Islander",
                "Hispanic or Latino" */
                numberOfPoses: 4,
                skinToneVariation: 1
            }
        },
    },
    setSettings : (settings)=>(set({settings})),
    saveSettings: async ()=>{
        set({loading: true});
        try{
            console.log("settings=", get().settings);
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
    restoreDefaultSettings: async ()=>{
        set({loading: true});
        try{
            set({settings: get().resetToDefault});
            toast.success("Default settings restored successfully");
        }catch(e){
            console.log(`Error restoring default settings: ${e}`);
            toast.error("Something went wrong");
        }finally{
            set({loading: false});
        }
    }
}))