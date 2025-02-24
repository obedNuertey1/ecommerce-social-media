import { useEffect, useRef } from 'react';
import { SaveIcon, RefreshCwIcon } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { THEMES } from '../constants';
import CustomThemeSelect from '../components/CustomThemeSelect';
import {waiting} from "../hooks/waiting";

const SettingsPage = () => {
    const socialMediaAutomationRef = useRef(null);
    const repostingRulesRef = useRef(null);
    const {settings, setSettings, saveSettings, loading, restoreDefaultSettings} = useSettingsStore();


    useEffect(()=>{
      const updateUI = async ()=>{
        if(settings.autoPost.instagram || settings.autoPost.facebook || settings.autoPost.threads){
          // startTimer();
          // socialMediaAutomationRef.current?.classList.add('grid-cols-1');
          await waiting(500);
          repostingRulesRef.current?.classList.remove("hidden");
          socialMediaAutomationRef.current?.classList.add('md:grid-cols-2');
        }else{
          await waiting(500);
          // startTimer();
          socialMediaAutomationRef.current?.classList.remove('md:grid-cols-2');
          // socialMediaAutomationRef.current?.classList.remove("grid-cols-1");
          repostingRulesRef.current?.classList.add("hidden")
        }
      }
      updateUI();
    },[settings.autoPost]);


    const handleRestoreDefaults = () => {
      if(confirm("Are you sure you want to restore default settings?")){
        localStorage.setItem("preferred-theme", "forest");
        restoreDefaultSettings();
      }
    }

    const modelDiversityOptions = [
      "Multiracial",
      "White",
      "Black or African American",
      "Asian",
      "American Indian or Alaska Native",
      "Native Hawaiian or Other Pacific Islander",
      "Hispanic or Latino"
    ]
  
  const aiModels = [
    {
      id: 'models/gemini-2.0-flash',
      name: 'gemini-2.0-flash',
      pros: ['Ideal for real-time applications', 'Lower operational costs in high-volume scenarios', 'Responsive performance'],
      cons: ['Limited depth', 'Handles shorter context windows', 'Not ideal for complex tasks']
    },
    {
      id: "models/gemini-2.0-flash-lite-preview-02-05",
      name: "gemini-2.0-flash-lite-preview-02-05",
      pros: [
        "For lightweight applications",
        "Fast Response",
        "For smaller-scale environments"
      ],
      cons: [
        "May have limited features or stability",
        "Reduced Capability"
      ]
    },
    {
      id: "models/gemini-1.5-flash",
      name: "gemini-1.5-flash",
      pros: [
        "Rapid Response",
        "For interactive applications",
        "Balances speed with resource use"
      ],
      cons: [
        "Limited Depth",
        "Shorter Context",
        "Not for in-depth analysis"
      ]
    },
    {
      id: "models/gemini-1.5-flash-8b",
      name: "gemini-1.5-flash-8b",
      pros: [
        "Fast & Efficient",
        "Offers solid trade-off between quality & resource use",
        "For moderately complex tasks without high expense"
      ],
      cons: [
        "May underperform on highly nuanced or complex queries",
        "Reduced Context",
        "Fewer Advanced Features"
      ]
    },
    {
      id: "models/gemini-1.5-pro",
      name: "gemini-1.5-pro",
      pros: [
        "High Accuracy",
        "Enhanced Performance",
        "Robust Capabilities"
      ],
      cons: [
        "Increasing cost for casual users",
        "Higher Resource Needs",
        "Overkill for Simple Tasks"
      ]
    },
  ];

  // Update the root <html> element's data-theme attribute on theme change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.visualCustomization.themeSelection.theme);
  }, [settings.visualCustomization.themeSelection.theme]);

  // Handler for the Save button
  const handleSave = () => {
    // Your save logic here; for demo, we'll show an alert.
    saveSettings();
  };

  return (
    <div className="min-h-screen p-8">
      <div className='max-w-7xl mx-auto flex flex-row items-center justify-center'>
        <div 
        // className="max-w-7xl mx-auto"
        className='w-full'
        >
          <h1 className="text-4xl font-bold mb-8">Advanced Store Settings</h1>
          <div className="container">
          <div className="grid gap-8 grid-cols-1 items-center justify-center">
            {/* Social Media Automation */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Social Media Automation</h2>
                
                <div ref={socialMediaAutomationRef} className="grid gap-6 items-center justify-center">
                  <div >
                    <h3 className="text-lg font-semibold mb-4">Auto-Posting</h3>
                    <label className="cursor-pointer label flex items-center space-x-2">
                      <span className="label-text">Instagram Auto-Post</span>
                      <input
                        type="checkbox"
                        className="toggle"
                        checked={settings.autoPost.instagram}
                        onChange={(e)=> setSettings({...settings, autoPost:{...settings.autoPost, instagram: e.target.checked}})}
                      />
                    </label>
                    <label className="cursor-pointer label flex items-center space-x-2">
                      <span className="label-text">Facebook Auto-Post</span>
                      <input
                        type="checkbox"
                        className="toggle"
                        checked={settings.autoPost.facebook}
                        onChange={(e) => setSettings({...settings, autoPost:{...settings.autoPost, facebook: e.target.checked}})}
                      />
                    </label>
                    <label className="cursor-pointer label flex items-center space-x-2">
                      <span className="label-text">Threads Auto-Post</span>
                      <input
                        type="checkbox"
                        className="toggle"
                        checked={settings.autoPost.threads}
                        onChange={(e) => setSettings({...settings, autoPost:{...settings.autoPost, threads: e.target.checked}})}
                      />
                    </label>
                  </div>

                {/* {(settings.autoPost.instagram || settings.autoPost.facebook || settings.autoPost.threads) && 
                } */}
                  <div className={`${(settings.autoPost.instagram || settings.autoPost.facebook || settings.autoPost.threads)? "translate-0 opacity-100": "-translate-y-3 opacity-0"} transition-all duration-500`} ref={repostingRulesRef}>
                    <h3 className="text-lg font-semibold mb-4">Reposting Rules</h3>
                    <div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Interaction Threshold</span>
                        </label>
                        <input 
                          type="number" 
                          min="0"
                          value={settings.repostingRules.interactionThreshold}
                          onChange={(e)=>setSettings({...settings, repostingRules:{...settings.repostingRules, interactionThreshold: e.target.value}})}
                          className="input input-bordered" 
                          placeholder="Minimum interactions"
                        />
                      </div>
                      <div className="form-control mt-4">
                        <label className="label">
                          <span className="label-text">Check Frequency</span>
                        </label>
                        <select
                          className="select select-bordered"
                          value={settings.repostingRules.checkFrequency}
                          onChange={(e) => setSettings({...settings, repostingRules:{...settings.repostingRules, checkFrequency: e.target.value}})}
                        >
                          <option value="1">Every 24 hours</option>
                          <option value="2">Every 48 hours</option>
                          <option value="7">Weekly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Configuration */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">AI Configuration</h2>
                
                <div className="grid md:grid-cols-2 gap-6 items-center justify-center">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Product Descriptions</h3>
                    <label className="cursor-pointer label flex items-center space-x-2">
                      <span className="label-text">Enable AI Descriptions</span>
                      <input
                        type="checkbox"
                        className="toggle"
                        checked={settings.aiConfigurations.productDescriptions.enableAiDescriptions}
                        onChange={(e) => setSettings({
                          ...settings,
                          aiConfigurations: {
                            ...settings.aiConfigurations,
                            productDescriptions: {
                              ...settings.aiConfigurations.productDescriptions,
                              enableAiDescriptions: e.target.checked
                            }
                          }
                        })}
                      />
                    </label>
                    <div 
                    className={`mt-4 ${(settings.aiConfigurations.productDescriptions.enableAiDescriptions === true)? "translate-0 opacity-100": "-translate-y-3 opacity-0"} transition-all duration-500`}
                    >
                      <label className="label">Description Style</label>
                      <div className="join">
                          <input className="join-item btn" type="radio" name="desc-style" aria-label="Creative" value="creative" 
                          // onChange={(e)=>setDescStyle(e.target.value)} checked={descStyle==="Creative"} 
                          onChange={(e)=>setSettings(
                            {
                              ...settings, aiConfigurations: {
                                ...settings.aiConfigurations,
                                productDescriptions:{
                                  ...settings.aiConfigurations.productDescriptions,
                                  descriptionStyle: e.target.value
                                }
                              }
                          })}
                          checked={settings.aiConfigurations.productDescriptions.descriptionStyle === "creative"}
                          />
                          <input className="join-item btn" type="radio" name="desc-style" aria-label="Technical" value="technical" 
                          // onChange={(e)=>setDescStyle(e.target.value)} checked={descStyle==="Technical"}
                          onChange={(e)=>setSettings(
                            {
                              ...settings, aiConfigurations: {
                                ...settings.aiConfigurations,
                                productDescriptions:{
                                  ...settings.aiConfigurations.productDescriptions,
                                  descriptionStyle: e.target.value
                                }
                              }
                          })}
                          checked={settings.aiConfigurations.productDescriptions.descriptionStyle === "technical"} 
                          />
                          <input className="join-item btn" type="radio" name="desc-style" aria-label="Casual" value="casual" 
                          // onChange={(e)=>setDescStyle(e.target.value)} checked={descStyle==="Casual"} 
                          onChange={(e)=>setSettings(
                            {
                              ...settings, aiConfigurations: {
                                ...settings.aiConfigurations,
                                productDescriptions:{
                                  ...settings.aiConfigurations.productDescriptions,
                                  descriptionStyle: e.target.value
                                }
                              }
                          })}
                          checked={settings.aiConfigurations.productDescriptions.descriptionStyle === "casual"}
                          />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Social Media Replies</h3>
                    <div className="form-control">
                      <label className="cursor-pointer label flex items-center space-x-2">
                        <span className="label-text">Manual Replies Only</span>
                        <input
                          type="radio"
                          name="reply-mode"
                          className="radio"
                          // checked={aiSettings.autoReply === 'manual'}
                          // onChange={() => setAiSettings({ ...aiSettings, autoReply: 'manual' })}
                          value="manual"
                          checked={settings.aiConfigurations.socialMediaReplies === "manual"}
                          onChange={(e)=>setSettings({...settings, aiConfigurations: {
                            ...settings.aiConfigurations,
                            socialMediaReplies: e.target.value
                          }})}
                        />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label flex items-center space-x-2">
                        <span className="label-text">AI Auto-Reply</span>
                        <input
                          type="radio"
                          name="reply-mode"
                          className="radio"
                          // checked={aiSettings.autoReply === 'ai-only'}
                          // onChange={() => setAiSettings({ ...aiSettings, autoReply: 'ai-only' })}
                          value="ai-only"
                          checked={settings.aiConfigurations.socialMediaReplies === "ai-only"}
                          onChange={(e)=>setSettings({...settings, aiConfigurations: {
                            ...settings.aiConfigurations,
                            socialMediaReplies: e.target.value
                          }})}
                        />
                      </label>
                    </div>
                    <div className="form-control">
                      <label className="cursor-pointer label flex items-center space-x-2">
                        <span className="label-text">AI Suggestions with Manual Approval</span>
                        <input
                          type="radio"
                          name="reply-mode"
                          className="radio"
                          // checked={aiSettings.autoReply === 'hybrid'}
                          // onChange={() => setAiSettings({ ...aiSettings, autoReply: 'hybrid' })}
                          value="hybrid"
                          checked={settings.aiConfigurations.socialMediaReplies === "hybrid"}
                          onChange={(e)=>setSettings({...settings, aiConfigurations: {
                            ...settings.aiConfigurations,
                            socialMediaReplies: e.target.value
                          }})}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="grid md:grid-cols-2 gap-6 items-center justify-center">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">AI Model Selection</h3>
                    <div className="form-control">
                      <label className="label">Choose AI Model</label>
                      <select
                        className="select select-bordered"
                        // value={aiSettings.model}
                        // onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
                        value={settings.aiConfigurations.aiModelSelection.model}
                        onChange={(e)=>setSettings({
                          ...settings,
                          aiConfigurations: {
                            ...settings.aiConfigurations,
                            aiModelSelection: {
                              ...settings.aiConfigurations.aiModelSelection,
                              model: e.target.value
                            }
                          }
                        })}
                      >
                        {aiModels.map(model => (
                          <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                      </select>
                    </div>
                    {aiModels.find(m => m.id === settings.aiConfigurations.aiModelSelection.model) && (
                      <div className="mt-4 bg-base-100 p-4 rounded-box">
                        <h4 className="font-semibold">Pros & Cons</h4>
                        <div className="mt-2">
                          <p className="text-success">✓ {aiModels.find(m => m.id === settings.aiConfigurations.aiModelSelection.model).pros[0]}</p>
                          <p className="text-error">✗ {aiModels.find(m => m.id === settings.aiConfigurations.aiModelSelection.model).cons[0]}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Reports Generation</h3>
                    <label className="cursor-pointer label flex items-center space-x-2">
                      <span className="label-text">Automatic PDF Reports</span>
                      <input
                        type="checkbox"
                        className="toggle"
                        checked={settings.aiConfigurations.reportsGeneration.automaticPdfReports}
                        onChange={(e) => setSettings({
                          ...settings,
                          aiConfigurations: {
                            ...settings.aiConfigurations,
                            reportsGeneration: {
                              ...settings.aiConfigurations.reportsGeneration,
                              automaticPdfReports: e.target.checked
                            }
                          }
                        })}
                      />
                    </label>
                    <div 
                    className={`form-control mt-4 ${(settings.aiConfigurations.reportsGeneration.automaticPdfReports)? "translate-0 opacity-100": "-translate-y-3 opacity-0"} transition-all duration-500`}
                    >
                      <label className="label">Report Frequency</label>
                      <select
                        className="select select-bordered"
                        // value={aiSettings.reportFrequency}
                        // onChange={(e) => setAiSettings({ ...aiSettings, reportFrequency: e.target.value })}
                        value={settings.aiConfigurations.reportsGeneration.reportFrequency}
                        onChange={(e)=>setSettings({
                          ...settings,
                          aiConfigurations:{
                            ...settings.aiConfigurations,
                            reportsGeneration:{
                              ...settings.aiConfigurations.reportsGeneration,
                              reportFrequency: e.target.value
                            }
                          }
                        })}
                      >
                        <option value="1" selected={settings.aiConfigurations.reportsGeneration.reportFrequency === "1"}>Daily</option>
                        <option value="7" selected={settings.aiConfigurations.reportsGeneration.reportFrequency === "7"}>Weekly</option>
                        <option value="30" selected={settings.aiConfigurations.reportsGeneration.reportFrequency === "30"}>Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Customization */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Visual Customization</h2>
                
                <div className="grid md:grid-cols-2 gap-6 items-start justify-center">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Theme Selection</h3>
                    <div className="form-control">
                      <label className="label">Choose Theme</label>
                      <div className="space-x-2">
                        <CustomThemeSelect
                            themes={THEMES}
                            currentTheme={settings.visualCustomization.themeSelection.theme}
                            onThemeChange={(newTheme) => {
                              localStorage.setItem("preferred-theme", newTheme);
                              setSettings({
                                ...settings,
                                visualCustomization: {
                                  ...settings.visualCustomization,
                                  themeSelection: {
                                    ...settings.visualCustomization.themeSelection,
                                    theme: newTheme
                                  }
                                }
                              });
                            }}
                          />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col h-full">
                    <h3 className="text-lg font-semibold mb-4">Clothing AI Settings</h3>
                    <label className="cursor-pointer label flex items-center space-x-2">
                      <span className="label-text">Enable Virtual Try-On Generation</span>
                      <input
                        type="checkbox"
                        className="toggle"
                        checked={settings.visualCustomization.clothingAiSettings.enableVirtualTryOnGeneration}
                        onChange={(e)=>setSettings({
                          ...settings,
                          visualCustomization: {
                            ...settings.visualCustomization,
                            clothingAiSettings: {
                              ...settings.visualCustomization.clothingAiSettings,
                              enableVirtualTryOnGeneration: e.target.checked
                            }
                          }
                        })}
                      />
                    </label>
                    
                    <div 
                    className={`mt-4 space-y-4 ${(settings.visualCustomization.clothingAiSettings.enableVirtualTryOnGeneration)? "translate-0 opacity-100": "-translate-y-3 opacity-0"} transition-all duration-500`}
                    >
                      <div className="form-control">
                        <label className="label">Model Diversity</label>
                        <select
                          className="select select-bordered"
                          // value={clothingAi.race}
                          // onChange={(e) => setClothingAi({ ...clothingAi, race: e.target.value })}
                          value={settings.visualCustomization.clothingAiSettings.modelDiversity}
                          onChange={(e)=>setSettings({
                            ...settings,
                            visualCustomization: {
                              ...settings.visualCustomization,
                              clothingAiSettings: {
                                ...settings.visualCustomization.clothingAiSettings,
                                modelDiversity: e.target.value
                              }
                            }
                          })}
                        >
                          {modelDiversityOptions.map((option, i)=>(
                            <option key={i} value={option.toLowerCase()}>{option}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Number of Poses</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="6"
                          className="input input-bordered"
                          // value={clothingAi.poses}
                          // onChange={(e) => setClothingAi({ ...clothingAi, poses: e.target.value })}
                          value={settings.visualCustomization.clothingAiSettings.numberOfPoses}
                          onChange={(e)=>setSettings({
                            ...settings,
                            visualCustomization: {
                              ...settings.visualCustomization,
                              clothingAiSettings: {
                                ...settings.visualCustomization.clothingAiSettings,
                                numberOfPoses: e.target.value
                              }
                            }
                          })}
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Skin Tone Variation</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          className="range range-primary"
                          // value={clothingAi.skinTones}
                          // onChange={(e) => setClothingAi({ ...clothingAi, skinTones: e.target.value })}
                          value={settings.visualCustomization.clothingAiSettings.skinToneVariation}
                          onChange={(e)=>setSettings({
                            ...settings,
                            visualCustomization: {
                              ...settings.visualCustomization,
                              clothingAiSettings: {
                                ...settings.visualCustomization.clothingAiSettings,
                                skinToneVariation: e.target.value
                              }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="divider"></div>
              <div className="card-actions">
                <div className='flex items-center justify-center flex-wrap px-6 py-4 mb-6 mt-2 min-w-full gap-6'>
                  <button disabled={loading===true} onClick={handleSave} className="btn btn-primary min-w-full md:min-w-0 shadow-lg">
                      {
                        loading ? (<span className="loading loading-spinner loading-sm" />): (
                          <SaveIcon className="mr-2 size-6" />
                        )
                      }
                      Save Settings
                  </button>
                  <button disabled={loading===true} onClick={handleRestoreDefaults} className="btn btn-secondary shadow-lg min-w-full md:min-w-0">
                      {
                        loading ? (<span className="loading loading-spinner loading-sm" />): (
                          <RefreshCwIcon className="mr-2 size-6" />
                        )
                      }
                      Restore Defaults
                  </button>
                </div>
              </div>
            </div>

          </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
