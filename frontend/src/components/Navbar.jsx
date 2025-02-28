import { Link, useResolvedPath } from "react-router-dom";
import { ShoppingCartIcon, ShoppingBagIcon, SettingsIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import {useProductStore} from "../store/useProductStore";
function Navbar(){
    const {pathname} = useResolvedPath();
    const isHomePage = pathname === "/";
    const isSettingsPage = pathname === "/settings";
    const {products} = useProductStore();
    return (
        <div className="bg-base-100/80 backdrop-blur-lg border-b border-base-content/10 sticky top-0 z-50 w-full">
            <div className="max-w-7xl mx-auto">
                <div className="navbar px-4 min-h-16 justify-between">
                    {/* LOGO */}
                    <div className="flex-1 lg:flex-none">
                        <Link to="/">
                        <div className="flex items-center gap-2">
                            <ShoppingCartIcon className="size-9 text-primary -translate-x-2 transition-transform" />
                            <span className="flont-semibold font-mono tracking-widest text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">POSGRESTORE</span>
                        </div>
                        </Link>
                    </div>
                    {/* RIGHT SECTION */}
                    <div className="flex items-center gap-4">
                        {/* ThemeSelector goes in here */}
                        {
                            !isSettingsPage &&
                            <Link to="/settings" tabIndex={0} className="btn btn-ghost btn-circle">
                                <SettingsIcon className="size-5" />
                            </Link>
                        }
                        {/* Bag Icon */}
                        {isHomePage &&
                        <div className="indicator">
                            <div className="p-2 rounded-full hover:bg-base-200 transition-colors">
                                <span className="indicator-item badge badge-primary badge-sm">{products.length}</span>
                                <ShoppingBagIcon className="size-5" />
                            </div>
                        </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;