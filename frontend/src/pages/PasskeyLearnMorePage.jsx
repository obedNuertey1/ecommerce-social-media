import { Key, Settings, Shield, ArrowLeftIcon, RotateCw, ClipboardList, Hash } from "lucide-react";
import { useProductStore } from "../store/useProductStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const PasskeyLearnMorePage = () => {
    const { resetFormData } = useProductStore();
    const navigate = useNavigate();
    useEffect(()=>{
        window.scrollTo(0, 0);
    },[])
    return (
        <div className="p-6 max-w-6xl mx-auto bg-base-300/50 min-h-screen">
            <button
                onClick={() => {
                    resetFormData();
                    navigate(-1);
                }}
                className="btn btn-ghost mb-8"
            >
                <ArrowLeftIcon className="size-5 mr-2" />
                Back to Passkeys
            </button>
            <div className="mb-8">
                <h1 className="text-2xl pb-1 text-center lg:text-4xl font-bold mt-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Passkey Management Guide
                </h1>
            </div>
{/* className="text-2xl lg:text-3xl font-bold" */}
            <div className="space-y-4">
                {/* Overview */}
                <div className="collapse collapse-plus bg-base-200">
                    <input type="radio" name="accordion" defaultChecked />
                    <div className="collapse-title text-xl font-medium flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Overview
                    </div>
                    <div className="collapse-content">
                        <p className="text-lg leading-relaxed">
                            Our passkey system is designed to give you granular control over who can access specific parts of your admin panel. Rather than creating full user accounts for every collaborator or partner, you can generate unique passkeys that carry defined privileges. This makes it easier and more efficient to manage access for different roles on your ecommerce website.
                        </p>
                    </div>
                </div>

                {/* How It Works */}
                <div className="collapse collapse-plus bg-base-200">
                    <input type="radio" name="accordion" />
                    <div className="collapse-title text-xl font-medium flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        How It Works
                    </div>
                    <div className="collapse-content space-y-4">
                        <div className="bg-base-100 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                                <Hash className="w-4 h-4" />
                                Unique Hash Generation
                            </h3>
                            <p>Each passkey is created using a secure, random hash function. This ensures that every passkey is unique and difficult to guess.</p>
                        </div>

                        <div className="bg-base-100 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4" />
                                Custom Privileges
                            </h3>
                            <p>When you generate a passkey, you can assign a set of privileges such as Admin, Editor, Viewer, or Billing. Each passkey acts as a key that unlocks specific features of your admin page.</p>
                        </div>

                        <div className="bg-base-100 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                                <ClipboardList className="w-4 h-4" />
                                Access Control
                            </h3>
                            <p>By assigning different privilege levels, you control which sections of your admin panel a person can access. For example, a passkey with "Viewer" privileges may only allow someone to read data, whereas an "Editor" or "Admin" passkey can also enable modifications.</p>
                        </div>
                    </div>
                </div>

                {/* Benefits */}
                <div className="collapse collapse-plus bg-base-200">
                    <input type="radio" name="accordion" />
                    <div className="collapse-title text-xl font-medium flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Benefits
                    </div>
                    <div className="collapse-content space-y-3">
                        <div className="alert alert-success">
                            <div>
                                <span className="font-bold">Simplicity:</span> Quickly generate and distribute access without the overhead of setting up full user accounts.
                            </div>
                        </div>
                        <div className="alert alert-info">
                            <div>
                                <span className="font-bold">Flexibility:</span> Tailor access for different roles. Whether you need someone to view analytics, edit product details, or manage orders, a passkey can be customized to fit the role.
                            </div>
                        </div>
                        <div className="alert alert-warning">
                            <div>
                                <span className="font-bold">Security:</span> The use of cryptographically secure hash generation means your passkeys are robust. By controlling privileges at the passkey level, you limit exposure even if a passkey is misused.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Best Practices */}
                <div className="collapse collapse-plus bg-base-200">
                    <input type="radio" name="accordion" />
                    <div className="collapse-title text-xl font-medium flex items-center gap-2">
                        <RotateCw className="w-5 h-5" />
                        Best Practices
                    </div>
                    <div className="collapse-content space-y-4">
                        <div className="bg-base-100 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Security Responsibility</h3>
                            <p>While passkeys offer a convenient access control method, they also require diligent management. If a passkey falls into the wrong hands, unauthorized access to your admin features could occur. It’s essential to monitor usage, revoke passkeys that are no longer needed, and rotate them periodically if necessary.</p>
                        </div>

                        <div className="bg-base-100 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Implementation Guidelines</h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Regular Reviews:</strong> Periodically review the list of active passkeys and their privileges. Remove or update any that are no longer necessary.</li>
                                <li><strong>Monitor Logs:</strong> Use the built-in logging functionality to track passkey usage. This can help you quickly identify any unusual activity and take corrective action.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasskeyLearnMorePage;