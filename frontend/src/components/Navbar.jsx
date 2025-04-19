import { Link, useResolvedPath, useNavigate } from "react-router-dom";
import { ShoppingCartIcon, ShoppingBagIcon, SettingsIcon, PackageIcon, KeyIcon, MenuIcon, XIcon, LogOutIcon } from "lucide-react";
import { useProductStore } from "../store/useProductStore";
import { useOrderStore } from "../store/useOrderStore";
import { usePasskeyStore } from "../store/usePasskeyStore";
import { useState, useRef, useEffect } from "react";
import { useGoogleAuthContext } from "../contexts/GoogleAuthContext";
import { decryptData } from "../funcs/essentialFuncs";

const ENCRYPT_DECRYPT_KEY = import.meta.env.VITE_ENCRYPT_DECRYPT_KEY;

function Navbar() {
    const { pathname } = useResolvedPath();
    const isHomePage = pathname === "/";
    const isSettingsPage = pathname === "/settings";
    const isOrdersPage = pathname === "/orders";
    const isPasskeyPage = pathname === "/passkey";
    const isPasskeyLogsPage = pathname === "/passkey/logs";
    const isPasskeyLearnMorePage = pathname === "/passkeys/learn-more";
    const isConversionFunnelBusinessInsightPage = pathname === "/info/charts-learn-more";
    const isProductCommentsPage = /^\/product\/\d+\/comments\/?$/.test(pathname);
    const isInfoPage = /^\/info\/?.*$/.test(pathname);
    const isProductPage = /^\/product\/\d+\/?$/.test(pathname);
    const isAnalyticsPage = /^\/product\/\d+\/analytics\/?$/.test(pathname);
    const isAuth = pathname === "/auth";
    const { products, resetFormData } = useProductStore();
    const { orders } = useOrderStore();
    const { setPasskey, updatePasskey, fetchPasskey } = usePasskeyStore();
    const { gapi } = useGoogleAuthContext();

    const settingsIsActive = !localStorage.hasOwnProperty("passkey") ? false : (localStorage.hasOwnProperty("passkey") && JSON.parse(localStorage.getItem("accessiblePages")).includes("settings")) ? false : true;
    const passkeyIsActive = !localStorage.hasOwnProperty("passkey") ? false : (localStorage.hasOwnProperty("passkey") && JSON.parse(localStorage.getItem("accessiblePages")).includes("passkeys")) ? false : true;
    const ordersIsActive = !localStorage.hasOwnProperty("passkey") ? false : (localStorage.hasOwnProperty("passkey") && JSON.parse(localStorage.getItem("accessiblePages")).includes("orders")) ? false : true;
    const productsIsActive = !localStorage.hasOwnProperty("passkey") ? false : (localStorage.hasOwnProperty("passkey") && JSON.parse(localStorage.getItem("accessiblePages")).includes("products")) ? false : true;

    const [isOpen, setIsOpen] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            let passkeyEncrypted = localStorage.getItem("passkey");
            try {
                if (passkeyEncrypted) {
                    let passkeyDecrypted = await decryptData(passkeyEncrypted, ENCRYPT_DECRYPT_KEY);
                    let passkey = JSON.parse(passkeyDecrypted);
                    const res = await fetchPasskey(passkey.id, gapi);
                    console.log({responseFromNavbar: res});
                    console.log({"res?.name === passkey.name": (res?.name === passkey.name)});
                    window.alert(`res?.name === passkey.name ${res?.name === passkey.name}`)
                    if(res?.name === passkey.name){
                        passkey.isOnline = "false";
                        passkey.accessiblePages = JSON.stringify(passkey.accessiblePages);
                        passkey.privileges = JSON.stringify(passkey.privileges);
                        setPasskey(passkey);
                        await updatePasskey(gapi, passkey.id);
                    }
                }
            } catch (e) {
                console.log(e);
            }
            // authService.logout();
            // Clear any relevant store data if needed
            gapi.auth2.getAuthInstance().signOut()
            resetFormData();
            localStorage.clear();
            // navigate("/auth");
            window.location.href = "/auth";
        } catch (e) {
            console.log(e);
            toast.error("Something went wrong");
        } finally {
            setLogoutLoading(false);
        }
    };

    // Click outside handler
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            setLogoutLoading(false);
        };
    }, [isOpen]);

    const navigate = useNavigate();

    // Common links for mobile menu
    const mobileMenuLinks = (
        <>
            <li>
                <Link to="/orders" onClick={(e) => {
                    if (ordersIsActive) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    setIsOpen(false)
                }} className={`flex ${ordersIsActive && "disabled"} justify-between`} tabIndex={ordersIsActive ? -1 : 0} aria-disabled={passkeyIsActive}>
                    <div className="flex items-center gap-2">
                        <PackageIcon className="size-5" />
                        Orders
                    </div>
                    <span className="badge badge-primary">{orders.length}</span>
                </Link>
            </li>
            <li>
                <Link to="/passkey" onClick={(e) => {
                    if (passkeyIsActive) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    setIsOpen(false)
                }} className={`flex items-center ${passkeyIsActive && "disabled"} gap-2`}
                    tabIndex={passkeyIsActive ? -1 : 0}
                    aria-disabled={passkeyIsActive}
                >
                    <KeyIcon className="size-5" />
                    Generate Passkey
                </Link>
            </li>
            <li>
                <Link to="/settings" aria-disabled={settingsIsActive} onClick={(e) => {
                    if (settingsIsActive) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    setIsOpen(false)
                }} className={`flex ${settingsIsActive && "disabled"} items-center gap-2`}
                    tabIndex={settingsIsActive ? -1 : 0}
                >
                    <SettingsIcon className="size-5" />
                    Settings
                </Link>
            </li>
            {isHomePage && (
                <li>
                    <Link to="/" onClick={(e) => {
                        if (productsIsActive) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                        setIsOpen(false)
                    }} className={`flex ${productsIsActive && "disabled"} justify-between`} aria-disabled={productsIsActive} tabIndex={productsIsActive ? -1 : 0} >
                        <div className="flex items-center gap-2">
                            <ShoppingBagIcon className="size-5" />
                            Products
                        </div>
                        <span className="badge badge-accent">{products.length}</span>
                    </Link>
                </li>
            )}
            <li>
                <button
                    onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                    }}
                    disabled={logoutLoading}
                    className="flex text-error justify-between text-left hover:bg-base-200"
                >
                    <div className="flex items-center gap-2">
                        {logoutLoading ?
                            <span className="loading loading-spinner loading-sm"></span>
                            :
                            <LogOutIcon className="size-5" />
                        }
                        Logout
                    </div>
                </button>
            </li>
        </>
    );

    return (
        <div className="bg-base-100/80 backdrop-blur-lg border-b border-base-content/10 sticky top-0 z-50 w-full">
            <div className="max-w-7xl mx-auto">
                <div className="navbar px-4 min-h-16">


                    {/* Logo */}
                    <div className="flex-1">
                        <Link
                            onClick={(e) => {
                                e.preventDefault();
                                resetFormData();
                                if(!productsIsActive){
                                    navigate("/");
                                }
                            }}
                            className="flex items-center gap-2 ml-2"
                        >
                            <ShoppingCartIcon className="size-9 text-primary" />
                            <span className="font-semibold font-mono tracking-widest text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                POSGRESTORE
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="flex-none hidden md:flex gap-2">
                        {(isOrdersPage || isSettingsPage || isPasskeyPage || isAnalyticsPage || isProductPage || isPasskeyLogsPage || isProductCommentsPage) && (
                            <>
                                <div className="indicator">
                                    <Link to="/orders" aria-disabled={ordersIsActive} className={`btn btn-ghost ${ordersIsActive ? "btn-disabled" : "btn-ghost"} btn-circle`}>
                                        <span className="indicator-item badge badge-primary badge-sm top-2 right-2">{orders.length}</span>
                                        <PackageIcon className="size-5" />
                                    </Link>
                                </div>
                                <Link to="/passkey" aria-disabled={passkeyIsActive} className={`btn ${passkeyIsActive ? "btn-disabled" : "btn-ghost"} btn-circle`}>
                                    <KeyIcon className="size-5" />
                                </Link>
                                <Link to="/settings" aria-disabled={settingsIsActive} className={`btn ${settingsIsActive ? "btn-disabled" : "btn-ghost"} btn-circle`}>
                                    <SettingsIcon className="size-5" />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-error btn-outline btn-circle"
                                    title="Logout"
                                    disabled={logoutLoading}
                                >
                                    {logoutLoading ?
                                        <span className="loading loading-spinner loading-sm"></span>
                                        :
                                        <LogOutIcon className="size-5" />
                                    }
                                </button>
                            </>
                        )}

                        {isHomePage && (
                            <>
                                <div className="indicator">
                                    <Link to="/orders" aria-disabled={ordersIsActive} className={`btn ${ordersIsActive ? "btn-disabled" : "btn-ghost"} btn-circle`}>
                                        <span className="indicator-item badge badge-primary badge-sm top-2 right-2">{orders.length}</span>
                                        <PackageIcon className="size-5" />
                                    </Link>
                                </div>
                                <Link to="/settings" aria-disabled={settingsIsActive} className={`btn ${settingsIsActive ? "btn-disabled" : "btn-ghost"} btn-circle`}>
                                    <SettingsIcon className="size-5" />
                                </Link>
                                <Link to="/passkey" aria-disabled={passkeyIsActive} className={`btn ${passkeyIsActive ? "btn-disabled" : "btn-ghost"} btn-circle`}>
                                    <KeyIcon className="size-5" />
                                </Link>
                                <div className="indicator">
                                    <div className="btn btn-ghost btn-circle">
                                        <span className="indicator-item badge badge-primary badge-sm top-2 right-2">
                                            {products.length}
                                        </span>
                                        <ShoppingBagIcon className="size-5" />
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-error btn-outline btn-circle"
                                    title="Logout"
                                    disabled={logoutLoading}
                                >
                                    {
                                        logoutLoading ?
                                            <span className="loading loading-spinner loading-sm"></span>
                                            :
                                            <LogOutIcon className="size-5" />
                                    }
                                </button>
                            </>
                        )}
                        {(isPasskeyLearnMorePage || isConversionFunnelBusinessInsightPage) && (
                            <button
                                onClick={handleLogout}
                                className="btn btn-error btn-outline btn-circle"
                                title="Logout"
                                disabled={logoutLoading}
                            >
                                {logoutLoading ?
                                    <span className="loading loading-spinner loading-sm"></span>
                                    :
                                    <LogOutIcon className="size-5" />
                                }
                            </button>
                        )}
                    </div>
                    {/* Mobile Menu */}
                    {!isAuth &&
                        <div className="flex-none md:hidden">
                            <div className={`dropdown ${isOpen ? "dropdown-open" : ""}`}>
                                <button ref={buttonRef} onClick={(e) => {
                                    e.preventDefault();
                                    setIsOpen(!isOpen);
                                }} tabIndex={0} className="btn btn-ghost btn-circle">
                                    <div className="indicator">
                                        <MenuIcon className={`size-5 transition-all duration-300 ${isOpen ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'}`} />
                                        <XIcon className={`absolute size-5 transition-all duration-300 ${isOpen ? 'scale-100 opacity-100 rotate-180' : 'scale-90 opacity-0 rotate-0'}`} />
                                        {!isOpen &&
                                            <div className="indicator indicator-item indicator-end flex items-center justify-end gap-[1px]">
                                                <span className="bg-primary border border-primary-content size-2 rounded-full" />
                                                {/* Will do same for spam above in the near future */}
                                                {(isHomePage && products.length > 0) && <span className="bg-accent border border-accent-content size-2 rounded-full" />}
                                            </div>
                                        }
                                    </div>
                                </button>
                                {isOpen &&
                                    <ul
                                        ref={menuRef}
                                        tabIndex={0}
                                        className="dropdown-content right-0 mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                                    >
                                        {mobileMenuLinks}
                                    </ul>
                                }
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default Navbar;