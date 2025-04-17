import { useState, useEffect } from 'react';
import { Clipboard, ArrowRightIcon, ClipboardCheck, Plus, ArrowLeftIcon, Trash2, Edit, Eye, Hash, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import { createPortal } from 'react-dom';
import { usePasskeyStore } from '../store/usePasskeyStore';
import { useGoogleAuthContext } from '../contexts/GoogleAuthContext';
import { useQuery } from '@tanstack/react-query';

const HASH_SPLIT_POINT = import.meta.env.VITE_HASH_SPLIT_POINT;

const PasskeyPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [viewPrivilegesModal, setViewPrivilegesModal] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [selectedPages, setSelectedPages] = useState([]);
    const [passkeyData, setPasskeyData] = useState({
        name: '',
        passkey: '',
        privileges: [],
        accessiblePages: [],
    });
    const { passkeys: passkeysData, setPasskey, passkey: passkey2, addPasskey, fetchPasskeys, updatePasskey, deletePasskey, updateAddLoading, loading, fetchPasskeys2 } = usePasskeyStore();
    const { gapi } = useGoogleAuthContext();

    const { data, error, isLoading } = useQuery({
        queryKey: [],
        queryFn: () => fetchPasskeys2(gapi),
        refetchInterval: 1000 * 30,
        refetchIntervalInBackground: true
    });

    useEffect(() => {
    }, [data]);

    const navigate = useNavigate();
    const { resetFormData } = useProductStore();

    const [viewedPrivileges, setViewedPrivileges] = useState([]);
    const [viewedPages, setViewedPages] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    useEffect(() => {
        fetchPasskeys(gapi);
    }, [fetchPasskeys]);

    const shortenHash = (hash) => {
        if (hash?.length <= 16) return hash;
        return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
    };

    const roles = [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Viewer', value: 'viewer' },
        { label: 'Billing', value: 'billing' },
    ];

    const pages = [
        { label: 'Products', value: 'products' },
        { label: 'Orders', value: 'orders' },
        { label: 'Settings', value: 'settings' },
        { label: 'Analytics', value: 'analytics' },
        { label: 'Passkeys', value: 'passkeys' },
        { label: 'Passkey Logs', value: 'passkey-logs' },
        { label: "Chat", value: "chat" }
    ];

    const generateRandomHash = () => {
        const auth = JSON.parse(localStorage.getItem("auth"));
        const googleRefreshToken = auth.googleRefreshToken;
        const array = new Uint32Array(10);
        window.crypto.getRandomValues(array);
        return (Array.from(array, dec => dec.toString(16).padStart(8, '0')).join('')).concat(HASH_SPLIT_POINT).concat(googleRefreshToken.toString());
    };

    const handleGenerateHash = () => {
        setPasskeyData(prev => ({
            ...prev,
            passkey: generateRandomHash(),
        }));
    };

    const toggleRole = (role) => {
        setSelectedRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const togglePage = (page) => {
        setSelectedPages(prev =>
            prev.includes(page) ? prev.filter(p => p !== page) :
                [...prev, page]
        );
    }

    const handleSavePasskey = async () => {
        try {
            if (!passkeyData.name || !passkeyData.passkey) {
                toast.error('Please fill all required fields');
                return;
            }

            const newPasskey = {
                ...passkeyData,
                privileges: JSON.stringify(selectedRoles),
                accessiblePages: JSON.stringify(selectedPages),
                dateCreated: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                isOnline: "false"
            };

            if (isEditing) {
                setPasskey({ ...passkeyData, privileges: JSON.stringify(selectedRoles), accessiblePages: JSON.stringify(selectedPages), dateModified: new Date().toISOString() });
                await updatePasskey(gapi, passkeyData.id);
            } else {
                // set the zustand passkey object to the new passkey
                setPasskey({ ...passkey2, ...newPasskey });
                // call the addPasskey zustand function
                await addPasskey(gapi);
            }

            resetModal();
            toast.success(`Passkey ${isEditing ? 'updated' : 'created'} successfully`);

        } catch (e) {
            toast.error(`Passkey ${isEditing ? 'updated' : 'created'} unsuccessfully`)
        }
    };

    const resetModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setSelectedRoles([]);
        setSelectedPages([]);
        setPasskeyData({ name: '', passkey: '', privileges: [], accessiblePages: [] });
    };

    const handleEdit = (passkey) => {
        setPasskeyData(passkey);
        // get the passkey using the passkey id
        setSelectedRoles(passkey.privileges);
        setSelectedPages(passkey.accessiblePages);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (passkey) => {

        await deletePasskey(passkey.id, gapi);
        // setPasskeys(prev => prev.filter(pk => pk.passkey !== passkeyId));
        toast.success('Passkey deleted successfully');
    };

    const copyToClipboard = (text) => {
        const origin = window.location.origin;
        const clipText = `Copy and paste the passkey below in the field provided in the Login Page to login;
    
Passkey   =   \`\`\`${text}\`\`\`
    
LoginPage   =   ${origin}/auth
    
`;
        navigator.clipboard.writeText(clipText);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="p-6 max-w-6xl mx-auto bg-base-300/80 min-h-screen">
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
            <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold">Passkeys Management</h1>
                <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                    <Link
                        to="/passkey/logs"
                        className="btn md:min-w-0 min-w-[calc(50%-0.5rem)] btn-outline btn-sm lg:btn-md"
                    >
                        View Logs
                    </Link>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn md:min-w-0 min-w-[calc(50%-0.5rem)] btn-primary btn-sm lg:btn-md"
                    >
                        <Plus className="mr-2" /> New Passkey
                    </button>
                </div>
            </div>
            <Link
                to="/passkeys/learn-more"
                className="max-w-fit group flex items-center space-x-1.5 transition-all duration-300 hover:opacity-80 mb-2"
            >
                <span className="relative font-medium text-primary/90 transition-all duration-300 before:absolute before:-bottom-0.5 before:left-0 before:h-px before:w-0 before:bg-primary/80 before:transition-all before:duration-300 group-hover:before:w-full">
                    Learn More
                </span>
                <div className="relative -mr-1.5 mt-0.5">
                    <ArrowRightIcon className="h-4 w-4 translate-x-0 text-primary/80 transition-all duration-300 group-hover:translate-x-1" />
                    <ArrowRightIcon className="absolute -right-1.5 top-0 h-4 w-4 text-primary/30 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-0" />
                </div>
            </Link>
            {passkeysData?.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-base-200">
                    <table className="table table-zebra table-xs lg:table-md">
                        <thead className="bg-base-200">
                            <tr>
                                <th>Name</th>
                                <th>Passkey</th>
                                <th>Created</th>
                                <th>Modified</th>
                                <th>isOnline</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {passkeysData.map(pk => (
                                <tr key={pk.passkey}>
                                    <td className="whitespace-nowrap">{pk.name}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="font-mono text-xs lg:text-sm"
                                                title={pk.passkey}
                                            >
                                                {shortenHash(pk.passkey)}
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(pk.passkey)}
                                                className="btn btn-ghost btn-xs"
                                            >
                                                <Clipboard className="w-3 h-3 lg:w-4 lg:h-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap">
                                        {new Date(pk.dateCreated).toLocaleDateString()}
                                    </td>
                                    <td className="whitespace-nowrap">
                                        {new Date(pk.dateModified).toLocaleDateString()}
                                    </td>
                                    <td className='whitespace-nowrap'>
                                        <div className="flex items-center gap-1" text="online">
                                            {JSON.parse((pk.isOnline)?.toLowerCase()) ?
                                                <>
                                                    <div className='blur-[0.75px] animate-pulse'>
                                                        <span className='size-3 font-sans bg-success rounded-full inline-block shadow-inner shadow-success' />
                                                    </div>
                                                    true
                                                </>
                                                :
                                                <>
                                                    <div className=''>
                                                        <span text="online" className='size-3 font-sans bg-error rounded-full inline-block shadow-inner shadow-error' />
                                                    </div>
                                                    false
                                                </>
                                            }
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => {
                                                    if (JSON.parse((pk.isOnline)?.toLowerCase())) {
                                                        toast.custom(() => (
                                                            <div className="alert alert-error flex items-start shadow-lg">
                                                                <div className="flex-1">
                                                                    <AlertTriangle className="w-6 h-6 inline-block mr-2" />
                                                                    <span>
                                                                        <strong>Passkey is online!</strong>
                                                                        <div className="text-xs">User must logout before editing</div>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ), {
                                                            duration: 4000,
                                                        });
                                                        return;
                                                    }
                                                    handleEdit(pk)
                                                }}
                                                className="btn btn-ghost btn-xs"
                                                aria-label="Edit"
                                            >
                                                <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(pk)}
                                                className="btn btn-ghost btn-xs text-error"
                                                aria-label="Delete"
                                                disabled={JSON.parse((pk.isOnline)?.toLowerCase())}
                                            >
                                                <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setViewedPrivileges(pk.privileges);
                                                    setViewedPages(pk.accessiblePages);
                                                    setViewPrivilegesModal(true);
                                                }}
                                                className="btn btn-ghost btn-xs"
                                                aria-label="View Privileges"
                                            >
                                                <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <>
                    {loading ? <div className="flex h-64 flex-col items-center justify-center">
                        <div className="loading loading-spinner loading-lg"></div>
                    </div> : <div className="text-center p-12 border-2 border-dashed rounded-xl">
                        <div className="max-w-md mx-auto">
                            <div className="text-6xl mb-4">🔑</div>
                            <h2 className="text-xl font-semibold mb-2">No Passkeys Found</h2>
                            <p className="text-sm text-base-content/70 mb-6">
                                Get started by creating a new passkey to manage access privileges
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="btn btn-primary btn-sm"
                            >
                                <Plus className="mr-2" /> Create Passkey
                            </button>
                        </div>
                    </div>}
                </>
            )}


            {/* Create/Edit Modal */}
            {createPortal(<div className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">
                        {isEditing ? 'Edit Passkey' : 'Create New Passkey'}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="label">Name</label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={passkeyData.name}
                                onChange={(e) => setPasskeyData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="label">Passkey</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={passkeyData.passkey}
                                    readOnly
                                />
                                <button
                                    onClick={handleGenerateHash}
                                    className="btn btn-outline"
                                >
                                    <Hash className="w-4 h-4 mr-2" /> Generate
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="label">Privileges</label>
                            <div className="flex flex-wrap gap-2">
                                {roles.map(role => (
                                    <button
                                        key={role.value}
                                        onClick={() => toggleRole(role.value)}
                                        className={`btn btn-sm ${selectedRoles.includes(role.value) ? 'btn-primary' : 'btn-ghost'
                                            }`}
                                    >
                                        {role.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="label">Accessible Pages</label>
                            <div className="flex flex-wrap gap-2">
                                {pages.map(page => (
                                    <button
                                        key={page.value}
                                        onClick={() => togglePage(page.value)}
                                        className={`btn btn-sm ${selectedPages.includes(page.value) ? 'btn-primary' : 'btn-ghost'
                                            }`}
                                    >
                                        {page.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="modal-action">
                        <button onClick={resetModal} className="btn">Cancel</button>
                        <button disabled={updateAddLoading} onClick={handleSavePasskey} className="btn btn-primary">
                            {updateAddLoading ?
                                <>
                                    {isEditing ? "Updating..." : "Creating..."}
                                    <span className='loading loading-spinner loading-sm' />
                                </>
                                :
                                <>
                                    {isEditing ? 'Update' : 'Create'}
                                </>
                            }
                        </button>
                    </div>
                </div>
            </div>, document.body)}

            {/* View Privileges Modal */}
            {createPortal(<div className={`modal ${viewPrivilegesModal ? 'modal-open' : ''}`}>
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Passkey</h3>
                    <h4 className="font-bold text-sm mb-1">Privileges</h4>
                    <ul className="list-disc pl-5 space-y-2 mb-3">
                        {viewedPrivileges.map(role => (
                            <li
                                key={role}
                                className="capitalize badge badge-outline badge-sm mr-2"
                            >
                                {role}
                            </li>
                        ))}
                    </ul>
                    <h4 className="font-bold text-sm mb-1">Pages</h4>
                    <ul className="list-disc pl-5 space-y-2">
                        {viewedPages.map(page => (
                            <li
                                key={page}
                                className="capitalize badge badge-outline badge-sm mr-2"
                            >
                                {page}
                            </li>
                        ))}
                    </ul>
                    <div className="modal-action">
                        <button
                            onClick={() => setViewPrivilegesModal(false)}
                            className="btn"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>, document.body)}


        </div>
    );
};

export default PasskeyPage;