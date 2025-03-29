import { Link, useResolvedPath, useNavigate } from "react-router-dom";
import { ShoppingCartIcon, ShoppingBagIcon, SettingsIcon, PackageIcon, KeyIcon, MenuIcon, XIcon } from "lucide-react";
import { useProductStore } from "../store/useProductStore";
import {useOrderStore} from "../store/useOrderStore";
import {useState, useRef, useEffect} from "react";

function Navbar() {
    const { pathname } = useResolvedPath();
    const isHomePage = pathname === "/";
    const isSettingsPage = pathname === "/settings";
    const isOrdersPage = pathname === "/orders";
    const isPasskeyPage = pathname === "/passkey";
    const isProductPage = /^\/product\/\d+\/?$/.test(pathname);
    const isAnalyticsPage = /^\/product\/\d+\/analytics\/?$/.test(pathname);
    const isInfoPage = /^\/info\/?.*$/.test(pathname);
    const isAuth = pathname === "/auth";
    const { products, resetFormData } = useProductStore();
    const {orders} = useOrderStore();

    const [isOpen, setIsOpen] = useState(false);

    const menuRef = useRef(null);
    const buttonRef = useRef(null);

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
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const navigate = useNavigate();

    // Common links for mobile menu
    const mobileMenuLinks = (
        <>
            <li>
                <Link to="/orders" onClick={()=>setIsOpen(false)} className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <PackageIcon className="size-5" />
                        Orders
                    </div>
                    <span className="badge badge-primary">{orders.length}</span>
                </Link>
            </li>
            <li>
                <Link to="/passkey" onClick={()=>setIsOpen(false)} className="flex items-center gap-2">
                    <KeyIcon className="size-5" />
                    Generate Passkey
                </Link>
            </li>
            <li>
                <Link to="/settings" onClick={()=>setIsOpen(false)} className="flex items-center gap-2">
                    <SettingsIcon className="size-5" />
                    Settings
                </Link>
            </li>
            {isHomePage && (
                <li>
                    <Link to="/products" onClick={()=>setIsOpen(false)} className="flex justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingBagIcon className="size-5" />
                            Products
                        </div>
                        <span className="badge badge-accent">{products.length}</span>
                    </Link>
                </li>
            )}
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
                                navigate("/");
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
                        {(isOrdersPage || isSettingsPage || isPasskeyPage || isAnalyticsPage || isProductPage) && (
                            <>
                                <div className="indicator">
                                    <Link to="/orders" className="btn btn-ghost btn-circle">
                                        <span className="indicator-item badge badge-primary badge-sm top-2 right-2">{orders.length}</span>
                                        <PackageIcon className="size-5" />
                                    </Link>
                                </div>
                                <Link to="/passkey" className="btn btn-ghost btn-circle">
                                    <KeyIcon className="size-5" />
                                </Link>
                                <Link to="/settings" className="btn btn-ghost btn-circle">
                                    <SettingsIcon className="size-5" />
                                </Link>
                            </>
                        )}

                        {isHomePage && (
                            <>
                                <div className="indicator">
                                    <Link to="/orders" className="btn btn-ghost btn-circle">
                                        <span className="indicator-item badge badge-primary badge-sm top-2 right-2">{orders.length}</span>
                                        <PackageIcon className="size-5" />
                                    </Link>
                                </div>
                                <Link to="/settings" className="btn btn-ghost btn-circle">
                                    <SettingsIcon className="size-5" />
                                </Link>
                                <Link to="/passkey" className="btn btn-ghost btn-circle">
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
                            </>
                        )}
                    </div>
                    {/* Mobile Menu */}
                    {!isAuth && 
                    <div className="flex-none md:hidden">
                        <div className={`dropdown ${isOpen ? "dropdown-open" : ""}`}>
                            <button ref={buttonRef} onClick={(e)=>{
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