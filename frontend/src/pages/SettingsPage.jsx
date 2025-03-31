import { useEffect, useRef } from 'react';
import { SaveIcon, RefreshCwIcon, ArrowLeftIcon, Instagram, Facebook, MessageCircle, AlertTriangle, MapPin } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { THEMES } from '../constants';
import CustomThemeSelect from '../components/CustomThemeSelect';
// import { waiting } from "../hooks/waiting";
import { cancellableWaiting } from '../funcs/waiting';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LoginSocialInstagram, LoginSocialFacebook } from 'reactjs-social-login';
import ThreadsSvgIcon from '../components/ThreadsSvgIcon';
import { useProductStore } from '../store/useProductStore';
import { useGoogleAuthContext } from '../contexts/GoogleAuthContext';

const SettingsPage = () => {
  const socialMediaAutomationRef = useRef(null);
  const repostingRulesRef = useRef(null);
  const { settings, setSettings, saveSettings, loading, restoreDefaultSettings, location, handleGetLocation } = useSettingsStore();
  const { auth_data, facebook_authenticate, instagram_authenticate, threads_authenticate } = useAuthStore();
  const { resetFormData } = useProductStore();
  const navigate = useNavigate();
  const modelDiversityRef = useRef(null);
  const reportFrequencyRef = useRef(null);
  const descriptionStyleRef = useRef(null);
  const {gapi} = useGoogleAuthContext();




  useEffect(() => {
    const updateUI = async () => {
      if (settings.autoPost.instagram || settings.autoPost.facebook || settings.autoPost.threads) {
        // startTimer();
        // socialMediaAutomationRef.current?.classList.add('grid-cols-1');
        const {promise, cancel} = cancellableWaiting(500);
        // await waiting(500);
        await promise;
        repostingRulesRef.current?.classList.remove("hidden");
        socialMediaAutomationRef.current?.classList.add('md:grid-cols-2');
        cancel();
      } else {
        // await waiting(500);
        const {promise, cancel} = cancellableWaiting(500);
        await promise;
        // startTimer();
        socialMediaAutomationRef.current?.classList.remove('md:grid-cols-2');
        // socialMediaAutomationRef.current?.classList.remove("grid-cols-1");
        repostingRulesRef.current?.classList.add("hidden")
        cancel();
      }
    }
    updateUI();
  }, [settings.autoPost]);


  const handleRestoreDefaults = () => {
    if (confirm("Are you sure you want to restore default settings?")) {
      localStorage.setItem("preferred-theme", "forest");
      restoreDefaultSettings(gapi);
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
    saveSettings(gapi);
  };

  return (
    <div className="min-h-screen p-8">
      <div className='max-w-7xl mx-auto flex flex-row items-center justify-center'>
        <div
          // className="max-w-7xl mx-auto"
          className='w-full'
        >
          <button
            onClick={() => {
              resetFormData();
              navigate("/");
            }}
            className="btn btn-ghost mb-8">
            <ArrowLeftIcon className="size-5 mr-2"
            />
            Back to Products
          </button>
          <h1 className="text-4xl font-bold mb-8">Advanced Store Settings</h1>
          <div className="container">
            <div className="grid gap-8 grid-cols-1 items-center justify-center">
              {/* Location Settings */}
              <div className="card bg-base-200 shadow-xl ">
                <div className='flex items-center justify-center'>
                  <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">Location Settings</h2>

                    <div className="space-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Automatic Location Detection</span>
                        </label>
                        <button
                          className="btn btn-primary"
                          onClick={handleGetLocation}
                          disabled={location.loading}
                        >
                          {
                            location.loading
                              ? (
                                <>
                                  <span className="loading loading-spinner"></span>
                                  Detecting Location...
                                </>
                              ) : (
                                <>
                                  <MapPin className="w-5 h-5 mr-2" />
                                  Get Current Location
                                </>
                              )}
                        </button>

                        {
                          location.error
                          && (
                            <div className="alert alert-error mt-4">
                              <AlertTriangle className="w-5 h-5 mr-2" />
                              {location.error}
                            </div>
                          )}

                        {
                          settings.address.timestamp
                          && (
                            <div className="mt-4 bg-base-100 p-4 rounded-box">
                              <p className="text-sm">

                                Detected: {settings.address.display_name}
                                <br />
                                <span className="text-xs opacity-75">
                                  Last updated:
                                  {new Date(settings.address.timestamp).toLocaleString()}
                                </span>
                              </p>
                            </div>
                          )}
                      </div>

                      <div className="divider">OR</div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Enter Location Manually</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          placeholder="Enter city or address"
                          value={settings.address.manualAddress}
                          onChange={(e) => setSettings({
                            ...settings,
                            address: {
                              ...settings.address,
                              manualAddress: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">Notification Settings</h2>

                  <div className="space-y-4">
                    {/* Mute Toggle */}
                    <div className="form-control">
                      <label className="label cursor-pointer">
                        <span className="label-text">Mute Notifications</span>
                        <input
                          type="checkbox"
                          className="toggle"
                          checked={settings.notifications.mute}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              mute: e.target.checked
                            }
                          })}
                        />
                      </label>
                    </div>

                    {/* Volume Control */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Notification Volume</span>
                        <span className="label-text-alt">{settings.notifications.volume}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.notifications.volume}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            volume: parseInt(e.target.value)
                          }
                        })}
                        className="range range-primary"
                        disabled={settings.notifications.mute}
                      />
                      <div className="w-full flex justify-between text-xs px-2">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Social Media Automation */}
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">Social Media Automation</h2>

                  <div ref={socialMediaAutomationRef} className="grid gap-6 ">
                    {/* Login with social accounts */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Auto-Posting</h3>

                      {/* Instagram */}
                      <div className="space-y-2 mb-4">
                        <label className="cursor-pointer label flex items-center justify-between">
                          <span className="label-text">Instagram Auto-Post</span>
                          <input
                            type="checkbox"
                            className="toggle"
                            checked={settings.autoPost.instagram}
                            onChange={(e) => setSettings({ ...settings, autoPost: { ...settings.autoPost, instagram: e.target.checked } })}
                          />
                        </label>
                        {!auth_data.instagram_user_id && (
                          <LoginSocialInstagram
                            client_id="Instagram_clientid"
                            client_secret="Instagram_client_secret"
                            onResolve={instagram_authenticate}
                            onReject={(error) => {

                              console.log(error);
                              toast.error("Something went wrong. Please try again later.")
                            }}
                          >
                            <button
                              className="btn bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white hover:opacity-90 flex-nowrap text-nowrap"
                              onClick={() => () => { }}
                            >
                              <Instagram className="w-5 h-5 mr-2" />
                              Continue with Instagram
                            </button>
                          </LoginSocialInstagram>
                        )}
                      </div>

                      {/* Facebook */}
                      <div className="space-y-2 mb-4">
                        <label className="cursor-pointer label flex items-center justify-between">
                          <span className="label-text">Facebook Auto-Post</span>
                          <input
                            type="checkbox"
                            className="toggle"
                            checked={settings.autoPost.facebook}
                            onChange={(e) => setSettings({ ...settings, autoPost: { ...settings.autoPost, facebook: e.target.checked } })}
                          />
                        </label>
                        {!auth_data.facebook_user_id && (
                          <LoginSocialFacebook
                            appId="Facebook_app_id"
                            onResolve={facebook_authenticate}
                            onReject={(error) => {
                              console.log(error);
                              toast.error("Something went wrong. Please try again later.")
                            }}
                          >
                            <button
                              className="btn bg-[#1877F2] text-white hover:bg-[#166FE5] flex-nowrap text-nowrap"
                              onClick={() => { }}
                            >
                              <Facebook className="w-5 h-5 mr-2" />
                              Continue with Facebook
                            </button>
                          </LoginSocialFacebook>
                        )}
                      </div>

                      {/* Threads */}
                      <div className="space-y-2 mb-4">
                        <label className="cursor-pointer label flex items-center justify-between">
                          <span className="label-text">Threads Auto-Post</span>
                          <input
                            type="checkbox"
                            className="toggle"
                            checked={settings.autoPost.threads}
                            onChange={(e) => setSettings({ ...settings, autoPost: { ...settings.autoPost, threads: e.target.checked } })}
                          />
                        </label>
                        {(!auth_data.threads_user_id) && (
                          <button
                            className="btn bg-black text-white hover:bg-gray-800"
                            onClick={threads_authenticate}
                          >
                            {/* <MessageCircle className="w-5 h-5 mr-2" /> Update this icon if you have a specific Threads icon */}
                            <ThreadsSvgIcon className="size-5 mr-2" />
                            Continue with Threads
                          </button>
                        )}
                      </div>
                    </div>
                    {/* End of Login with social accounts */}
                    {/* {(settings.autoPost.instagram || settings.autoPost.facebook || settings.autoPost.threads) && 
                } */}
                    <div className={`${(settings.autoPost.instagram || settings.autoPost.facebook || settings.autoPost.threads) ? "translate-0 opacity-100" : "-translate-y-3 opacity-0"} transition-all duration-500`} ref={repostingRulesRef}>
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
                            onChange={(e) => setSettings({ ...settings, repostingRules: { ...settings.repostingRules, interactionThreshold: e.target.value } })}
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
                            onChange={(e) => setSettings({ ...settings, repostingRules: { ...settings.repostingRules, checkFrequency: e.target.value } })}
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

                  <div className="grid md:grid-cols-2 gap-4 ">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Product Descriptions</h3>
                      <label className="cursor-pointer label flex items-center space-x-2">
                        <span className="label-text">Enable AI Descriptions</span>
                        <input
                          type="checkbox"
                          className="toggle"
                          checked={settings.aiConfigurations.productDescriptions.enableAiDescriptions}
                          onChange={async (e) => {
                            setSettings({
                              ...settings,
                              aiConfigurations: {
                                ...settings.aiConfigurations,
                                productDescriptions: {
                                  ...settings.aiConfigurations.productDescriptions,
                                  enableAiDescriptions: e.target.checked
                                }
                              }
                            })
                            // await waiting(500);
                            const {promise, cancel} = cancellableWaiting(500);
                            await promise;
                            if (e.target.checked && !descriptionStyleRef.current?.classList.contains("hidden")) {
                              descriptionStyleRef.current?.classList.remove("hidden");
                            } else {
                              descriptionStyleRef.current?.classList.add("hidden");
                            }
                            cancel();
                          }
                          }
                        />
                      </label>
                      {/* Lines affecting responsiveness */}
                      <div
                        ref={descriptionStyleRef}
                        // className={`mt-4 ${settings.aiConfigurations.productDescriptions.enableAiDescriptions
                        //     ? "opacity-100 visible h-auto"
                        //     : "opacity-0 invisible h-0"
                        //   } transition-all duration-300 overflow-hidden`}
                        className={`mt-4 ${(settings.aiConfigurations.productDescriptions.enableAiDescriptions === true) ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"} transition-all duration-500 overflow-hidden`}
                      >
                        <label className="label">Description Style</label>
                        <div className="join join-vertical w-full md:join-horizontal">
                          <input className="join-item btn flex-1 w-full text-sm md:text-base" type="radio" name="desc-style" aria-label="Creative" value="creative"
                            onChange={(e) => setSettings(
                              {
                                ...settings, aiConfigurations: {
                                  ...settings.aiConfigurations,
                                  productDescriptions: {
                                    ...settings.aiConfigurations.productDescriptions,
                                    descriptionStyle: e.target.value
                                  }
                                }
                              })}
                            checked={settings.aiConfigurations.productDescriptions.descriptionStyle === "creative"}
                          />
                          <input className="join-item btn flex-1 w-full text-sm md:text-base" type="radio" name="desc-style" aria-label="Technical" value="technical"
                            // onChange={(e)=>setDescStyle(e.target.value)} checked={descStyle==="Technical"}
                            onChange={(e) => setSettings(
                              {
                                ...settings, aiConfigurations: {
                                  ...settings.aiConfigurations,
                                  productDescriptions: {
                                    ...settings.aiConfigurations.productDescriptions,
                                    descriptionStyle: e.target.value
                                  }
                                }
                              })}
                            checked={settings.aiConfigurations.productDescriptions.descriptionStyle === "technical"}
                          />
                          <input className="join-item btn flex-1 w-full text-sm md:text-base" type="radio" name="desc-style" aria-label="Casual" value="casual"
                            // onChange={(e)=>setDescStyle(e.target.value)} checked={descStyle==="Casual"} 
                            onChange={(e) => setSettings(
                              {
                                ...settings, aiConfigurations: {
                                  ...settings.aiConfigurations,
                                  productDescriptions: {
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
                            onChange={(e) => setSettings({
                              ...settings, aiConfigurations: {
                                ...settings.aiConfigurations,
                                socialMediaReplies: e.target.value
                              }
                            })}
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
                            onChange={(e) => setSettings({
                              ...settings, aiConfigurations: {
                                ...settings.aiConfigurations,
                                socialMediaReplies: e.target.value
                              }
                            })}
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
                            onChange={(e) => setSettings({
                              ...settings, aiConfigurations: {
                                ...settings.aiConfigurations,
                                socialMediaReplies: e.target.value
                              }
                            })}
                          />
                        </label>
                      </div>
                    </div>
                  </div>


                  <div className="divider"></div>
                  {/* End of lines affecting responsiveness */}
                  <div className="grid md:grid-cols-2 gap-4">  {/* Changed gap-6 to gap-4 for better density */}
                    {/* AI Model Selection Section */}
                    <div className="w-full">  {/* Added w-full for proper grid behavior */}
                      <h3 className="text-lg font-semibold mb-4">AI Model Selection</h3>
                      <div className="form-control w-full">  {/* Added w-full */}
                        <label className="label">Choose AI Model</label>
                        <select
                          className="select select-bordered w-full"
                          value={settings.aiConfigurations.aiModelSelection.model}
                          onChange={(e) => setSettings({
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
                        <div className="mt-4 bg-base-100 p-4 rounded-box w-full">  {/* Added w-full */}
                          <h4 className="font-semibold">Pros & Cons</h4>
                          <div className="mt-2 space-y-2">  {/* Added space-y for vertical spacing */}
                            <p className="text-success">✓ {aiModels.find(m => m.id === settings.aiConfigurations.aiModelSelection.model).pros[0]}</p>
                            <p className="text-error">✗ {aiModels.find(m => m.id === settings.aiConfigurations.aiModelSelection.model).cons[0]}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Reports Generation Section */}
                    <div className="w-full">  {/* Added w-full */}
                      <h3 className="text-lg font-semibold mb-4">Reports Generation</h3>
                      <label className="cursor-pointer label flex items-center space-x-2">
                        <span className="label-text">Automatic PDF Reports</span>
                        <input
                          type="checkbox"
                          className="toggle"
                          checked={settings.aiConfigurations.reportsGeneration.automaticPdfReports}
                          onChange={async (e) => setSettings({
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
                        ref={reportFrequencyRef}
                        className={`${settings.aiConfigurations.reportsGeneration.automaticPdfReports
                          ? "visible opacity-100 h-auto"
                          : "invisible opacity-0 h-0"
                          } transition-all duration-500 overflow-hidden`}
                      >
                        <div className='form-control mt-4 w-full'>
                          <label className="label">Report Frequency</label>
                          <select
                            className="select select-bordered w-full"
                            value={settings.aiConfigurations.reportsGeneration.reportFrequency}
                            onChange={(e) => setSettings({
                              ...settings,
                              aiConfigurations: {
                                ...settings.aiConfigurations,
                                reportsGeneration: {
                                  ...settings.aiConfigurations.reportsGeneration,
                                  reportFrequency: e.target.value
                                }
                              }
                            })}
                          >
                            <option value="1">Daily</option>
                            <option value="7">Weekly</option>
                            <option value="30">Monthly</option>
                          </select>
                        </div>
                        <div className='form-control mt-4 w-full'>
                          <label className="label">
                            <span className="label-text">Enter email</span>
                          </label>
                          <input
                            type="email"
                            className="input input-bordered"
                            placeholder="Enter email to recieve pdf reports"
                            value={settings.aiConfigurations.reportsGeneration.email}
                            onChange={(e) => setSettings({
                              ...settings,
                              aiConfigurations: {
                                ...settings.aiConfigurations,
                                reportsGeneration: {
                                  ...settings.aiConfigurations.reportsGeneration,
                                  email: e.target.value
                                }
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Customization */}
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">Visual Customization</h2>

                  <div className="grid md:grid-cols-2 gap-6">
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
                      <h3 className="text-lg font-semibold mb-4">Product AI Settings</h3>
                      <label className="cursor-pointer label flex items-center space-x-2">
                        <span className="label-text">Enable Virtual Try-On Generation</span>
                        <input
                          type="checkbox"
                          className="toggle"
                          checked={settings.visualCustomization.productAiSettings.enableVirtualTryOnGeneration}
                          onChange={async (e) => {
                            setSettings({
                              ...settings,
                              visualCustomization: {
                                ...settings.visualCustomization,
                                productAiSettings: {
                                  ...settings.visualCustomization.productAiSettings,
                                  enableVirtualTryOnGeneration: e.target.checked
                                }
                              }

                            })
                            // await waiting(500);
                            const {promise, cancel} = cancellableWaiting(500);
                            await promise;
                            if (e.target.checked && !modelDiversityRef.current?.classList.contains("hidden")) {
                              modelDiversityRef.current?.classList.remove("hidden");
                            } else {
                              modelDiversityRef.current?.classList.add("hidden");
                            }
                            cancel();
                          }}
                        />
                      </label>

                      <div
                        ref={modelDiversityRef}
                        className={`mt-4 grid grid-cols-1 gap-4 ${settings.visualCustomization.productAiSettings.enableVirtualTryOnGeneration
                          ? "visible opacity-100"
                          : "invisible opacity-0"
                          } transition-all duration-500`}
                      >
                        <div className="form-control w-full">
                          <label className="label">Product Type</label>
                          <select
                            className="select select-bordered w-full"
                            value={settings.visualCustomization.productAiSettings.productType}
                            onChange={(e) => setSettings({
                              ...settings,
                              visualCustomization: {
                                ...settings.visualCustomization,
                                productAiSettings: {
                                  ...settings.visualCustomization.productAiSettings,
                                  productType: e.target.value
                                }
                              }
                            })}
                          >
                            {["clothing", "item", "property"].map((option, i) => (
                              <option key={i} value={option.toLowerCase()}>{option}</option>
                            ))}
                          </select>
                        </div>
                        {settings.visualCustomization.productAiSettings.productType !== "property"
                          &&
                          <>
                            <div className='divider m-0'></div>

                            <div className="form-control w-full">
                              <label className="label">Model Diversity</label>
                              <select
                                className="select select-bordered w-full"
                                value={settings.visualCustomization.productAiSettings.modelDiversity}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  visualCustomization: {
                                    ...settings.visualCustomization,
                                    productAiSettings: {
                                      ...settings.visualCustomization.productAiSettings,
                                      modelDiversity: e.target.value
                                    }
                                  }
                                })}
                              >
                                {modelDiversityOptions.map((option, i) => (
                                  <option key={i} value={option.toLowerCase()}>{option}</option>
                                ))}
                              </select>
                            </div>

                            <div className="form-control w-full">
                              <label className="label">
                                <span className="label-text">Number of Poses</span>
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="6"
                                className="input input-bordered w-full"
                                value={settings.visualCustomization.productAiSettings.numberOfPoses}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  visualCustomization: {
                                    ...settings.visualCustomization,
                                    productAiSettings: {
                                      ...settings.visualCustomization.productAiSettings,
                                      numberOfPoses: e.target.value
                                    }
                                  }
                                })}
                              />
                            </div>

                            <div className="form-control w-full">
                              <label className="label">
                                <span className="label-text">Skin Tone Variation</span>
                              </label>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                className="range range-primary"
                                value={settings.visualCustomization.productAiSettings.skinToneVariation}
                                onChange={(e) => setSettings({
                                  ...settings,
                                  visualCustomization: {
                                    ...settings.visualCustomization,
                                    productAiSettings: {
                                      ...settings.visualCustomization.productAiSettings,
                                      skinToneVariation: e.target.value
                                    }
                                  }
                                })}
                              />
                            </div>
                          </>
                        }
                      </div>
                    </div>
                  </div>
                </div>
                <div className="divider"></div>
                <div className="card-actions">
                  <div className='flex items-center justify-center flex-wrap px-6 py-4 mb-6 mt-2 min-w-full gap-6'>
                    <button disabled={loading === true} onClick={handleSave} className="btn btn-primary min-w-full md:min-w-0 shadow-lg">
                      {
                        loading ? (<span className="loading loading-spinner loading-sm" />) : (
                          <SaveIcon className="mr-2 size-6" />
                        )
                      }
                      Save Settings
                    </button>
                    <button disabled={loading === true} onClick={handleRestoreDefaults} className="btn btn-secondary shadow-lg min-w-full md:min-w-0">
                      {
                        loading ? (<span className="loading loading-spinner loading-sm" />) : (
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
