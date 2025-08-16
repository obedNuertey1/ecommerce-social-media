// frontend\src\pages\ProductPage3.jsx
// frontend/src/pages/ProductPage3.jsx
import { ArrowLeftIcon, PlusCircleIcon, SaveIcon, Package2Icon, DollarSignIcon, ImageIcon, Trash2Icon, EditIcon, ChevronLeftIcon, ChevronRightIcon, TextIcon, XIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import { useEffect, useState, useRef, useCallback } from "react";
import { useGoogleAuthContext } from "../contexts/GoogleAuthContext";
import { toast } from "react-hot-toast";
import { privilegeAccess, createLogs } from "../funcs/essentialFuncs";
import { commerceTaxCategories as COMMERCE_TAX_CATEGORIES } from "../static/commerceTaxCategories";

// List of all currencies (ISO 4217)
const CURRENCIES = [
    "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG",
    "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND",
    "BOB", "BOV", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD",
    "CDF", "CHE", "CHF", "CHW", "CLF", "CLP", "CNY", "COP", "COU",
    "CRC", "CUC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD",
    "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS",
    "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG",
    "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD",
    "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KYD",
    "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL",
    "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK",
    "MXN", "MXV", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR",
    "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG",
    "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG",
    "SEK", "SGD", "SHP", "SLL", "SOS", "SRD", "SSP", "STN", "SVC",
    "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD",
    "TWD", "TZS", "UAH", "UGX", "USD", "USN", "UYI", "UYU", "UYW",
    "UZS", "VES", "VND", "VUV", "WST", "XAF", "XAG", "XAU", "XBA",
    "XBB", "XBC", "XBD", "XCD", "XDR", "XOF", "XPD", "XPF", "XPT",
    "XSU", "XTS", "XUA", "XXX", "YER", "ZAR", "ZMW", "ZWL"
];

// Shipping weight units
const WEIGHT_UNITS = ["lb", "kg", "oz", "g"];

// New constants
const GENDER_OPTIONS = ["", "male", "female", "unisex"];
const AGE_GROUP_OPTIONS = ["", "newborn", "infant", "toddler", "kids", "adult"];
const SIZE_TYPE_OPTIONS = ["", "regular", "petite", "plus", "big and tall", "maternity"];
const SIZE_SYSTEM_OPTIONS = ["", "US", "UK", "EU", "AU", "BR", "CN", "IT", "JP", "MEX", "FR", "DE"];

function ProductPage3() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { fetchProduct, formData, loading, error, setFormData, product, deleteProduct, updateProduct, resetFormData } = useProductStore();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [newImageUrl, setNewImageUrl] = useState("");
    const [mediaToDelete, setMediaToDelete] = useState([]);
    const timeoutRef = useRef(null);
    const delayRef = useRef(3000);
    const { gapi } = useGoogleAuthContext();
    const { creatableAccess, deletableAccess, updatableAccess, readableAccess } = privilegeAccess();
    const pageLoadedRef = useRef(false);
    const [loadingCatalogues, setLoadingCatalogues] = useState(false);
    const [catalogues, setCatalogues] = useState([]);
    const token = import.meta.env.VITE_FACEBOOK_LONG_LIVED_TOKEN;

    useEffect(() => {
        fetchProduct(id, gapi);
    }, [id, fetchProduct]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const pageLoaded = () => {
            if (localStorage.getItem("passkey")) {
                if (pageLoadedRef.current) return;
                const passkeyName = localStorage.getItem("passkeyName");
                createLogs("Accessed", `${passkeyName} entered the ${formData.name} Product Page`)
                pageLoadedRef.current = true;
            }
        }
        pageLoaded();
        return () => { };
    }, []);

    // NEW: FETCH CATALOGUES WHEN COMPONENT LOADS
    useEffect(() => {
        const fetchCatalogues = async () => {
            if (gapi) {
                try {
                    setLoadingCatalogues(true);
                    if (token) {
                        const catalogList = await getProductCatalogs(token);
                        setCatalogues(catalogList);
                    }
                } catch (error) {
                    console.error("Failed to fetch catalogues:", error);
                } finally {
                    setLoadingCatalogues(false);
                }
            }
        };

        fetchCatalogues();
    }, [gapi]);

    // NEW: HANDLE CATALOGUE SELECTION
    const handleCatalogueChange = useCallback((e) => {
        const { value } = e.target;
        setFormData({
            ...formData,
            catalogueId: value === "new" ? "" : value,
            isNewCatalogue: value === "new"
        });
    }, [formData, setFormData]);

    const handleMediaUpload = useCallback((e) => {
        if (creatableAccess) return;
        const files = Array.from(e.target.files);
        const remainingSlots = 8 - formData.media.length;
        const newFiles = files.slice(0, remainingSlots).map(file => ({
            file,
            mediaUrl: URL.createObjectURL(file),
            id: Math.random().toString(36).substr(2, 9),
            operation: "add"
        }));

        setFormData({
            ...formData,
            media: [...formData.media, ...newFiles]
        });

        // Reset the input so the same file can be selected again if needed
        e.target.value = "";
    }, [formData, setFormData, creatableAccess]);

    const handleRemoveMedia = useCallback((mediaId) => {
        const mediaToRemove = formData.media.find(m => m.id === mediaId);
        if (mediaToRemove) {
            // If this media was added in this session, just remove it
            if (mediaToRemove.operation === "add") {
                setFormData({
                    ...formData,
                    media: formData.media.filter(m => m.id !== mediaId)
                });
            } else {
                // Mark for deletion and keep in list as "to be deleted"
                setMediaToDelete(prev => [...prev, mediaToRemove]);
                setFormData({
                    ...formData,
                    media: formData.media.map(m => 
                        m.id === mediaId ? {...m, markedForDeletion: true} : m
                    )
                });
            }
        }
    }, [formData, setFormData]);

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="alert alert-error">{error}</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this product?")) {
            await deleteProduct(id, gapi, product.mediaFolderId);
            resetFormData();
            navigate("/");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <button
                onClick={() => {
                    resetFormData();
                    navigate("/");
                }}
                className="btn btn-ghost mb-8"
            >
                <ArrowLeftIcon className="size-5 mr-2" />
                Back to Products
            </button>
            
            <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-6">Edit Product</h2>
                    
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        updateProduct(id, gapi, mediaToDelete);
                    }} className="space-y-6">
                        <div className="grid gap-6">
                            {/* CATALOGUE SECTION */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-base font-medium">Product Catalogue</span>
                                </label>
                                <div className="flex flex-col gap-3">
                                    {loadingCatalogues ? (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="loading loading-spinner loading-xs"></span>
                                            Loading catalogues...
                                        </div>
                                    ) : (
                                        <>
                                            <select
                                                className="select select-bordered w-full"
                                                value={formData.catalogueId || ""}
                                                onChange={handleCatalogueChange}
                                            >
                                                <option value="">Select a catalogue</option>
                                                {catalogues.map(catalogue => (
                                                    <option key={catalogue.id} value={catalogue.id}>
                                                        {catalogue.name} ({catalogue.product_count || 0} products)
                                                    </option>
                                                ))}
                                                <option value="new">+ Create New Catalogue</option>
                                            </select>

                                            {formData.isNewCatalogue && (
                                                <div className="mt-2">
                                                    <label className="label">
                                                        <span className="label-text text-sm font-medium">New Catalogue Name</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., 'Summer Collection'"
                                                        className="input input-bordered w-full py-2 text-sm"
                                                        value={formData.newCatalogueName || ""}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            newCatalogueName: e.target.value
                                                        })}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Product Information Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Product Name */}
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-base font-medium">Product Name</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                                                <Package2Icon className="size-5" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Enter product name"
                                                className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Price and Currency */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-base font-medium">Price</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                    className="input input-bordered w-full py-3 focus:input-primary transition-colors"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-base font-medium">Currency</span>
                                            </label>
                                            <select
                                                className="select select-bordered w-full py-3"
                                                value={formData.currency || "USD"}
                                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                                required
                                            >
                                                {CURRENCIES.map(currency => (
                                                    <option key={currency} value={currency}>
                                                        {currency}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-base font-medium">Tax Category</span>
                                                <span className="label-text-alt text-red-500">* Req</span>
                                            </label>
                                            <select
                                                required
                                                className="select select-bordered w-full py-3"
                                                value={formData.commerce_tax_category || ""}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    commerce_tax_category: e.target.value
                                                })}
                                            >
                                                <option value="">Select tax category</option>
                                                {COMMERCE_TAX_CATEGORIES.map(({ label, value }) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Brand and Category */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-base font-medium">Brand</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Samsung"
                                                className="input input-bordered w-full py-3"
                                                value={formData.brand || ""}
                                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-base font-medium">Category</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Electronics/Phones"
                                                className="input input-bordered w-full py-3"
                                                value={formData.category || ""}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Availability and Condition */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-base font-medium">Availability</span>
                                            </label>
                                            <select
                                                className="select select-bordered w-full py-3"
                                                value={formData.availability || "in stock"}
                                                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                                            >
                                                <option value="in stock">In Stock</option>
                                                <option value="out of stock">Out of Stock</option>
                                                <option value="preorder">Preorder</option>
                                                <option value="available for order">Available for Order</option>
                                            </select>
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-base font-medium">Condition</span>
                                            </label>
                                            <select
                                                className="select select-bordered w-full py-3"
                                                value={formData.condition || "new"}
                                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                            >
                                                <option value="new">New</option>
                                                <option value="refurbished">Refurbished</option>
                                                <option value="used">Used</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Inventory */}
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-base font-medium">Inventory Quantity</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="e.g., 25"
                                            className="input input-bordered w-full py-3"
                                            value={formData.inventoryQuantity || ""}
                                            onChange={(e) => setFormData({ ...formData, inventoryQuantity: e.target.value })}
                                        />
                                    </div>

                                    {/* Color and Size */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-base font-medium">Color</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Phantom Black"
                                                className="input input-bordered w-full py-3"
                                                value={formData.color || ""}
                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-base font-medium">Size</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., 512GB"
                                                className="input input-bordered w-full py-3"
                                                value={formData.size || ""}
                                                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Material */}
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-base font-medium">Material</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Glass, Aluminum"
                                            className="input input-bordered w-full py-3"
                                            value={formData.material || ""}
                                            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                                        />
                                    </div>

                                    {/* Shipping Weight */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-base font-medium">Shipping Weight</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="e.g., 0.45"
                                                className="input input-bordered w-full py-3"
                                                value={formData.shipping_weight || ""}
                                                onChange={(e) => setFormData({ ...formData, shipping_weight: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-base font-medium">Weight Unit</span>
                                            </label>
                                            <select
                                                className="select select-bordered w-full py-3"
                                                value={formData.shipping_weight_unit || "lb"}
                                                onChange={(e) => setFormData({ ...formData, shipping_weight_unit: e.target.value })}
                                            >
                                                {WEIGHT_UNITS.map(unit => (
                                                    <option key={unit} value={unit}>
                                                        {unit}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Custom Label */}
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-base font-medium">Custom Label</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Flagship"
                                            className="input input-bordered w-full py-3"
                                            value={formData.custom_label_0 || ""}
                                            onChange={(e) => setFormData({ ...formData, custom_label_0: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ADVANCED FIELDS SECTION */}
                            <details className="collapse collapse-arrow bg-base-200">
                                <summary className="collapse-title text-xl font-medium">Advanced Product Details</summary>
                                <div className="collapse-content grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        {/* Sale Price */}
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-base font-medium">Sale Price</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                placeholder="Discounted price"
                                                className="input input-bordered w-full"
                                                value={formData.sale_price || ""}
                                                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                                            />
                                        </div>

                                        {/* Sale Price Effective Date */}
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-base font-medium">Sale Period</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="YYYY-MM-DD/YYYY-MM-DD"
                                                className="input input-bordered w-full"
                                                value={formData.sale_price_effective_date || ""}
                                                onChange={(e) => setFormData({ ...formData, sale_price_effective_date: e.target.value })}
                                            />
                                        </div>

                                        {/* GTIN & MPN */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text text-base font-medium">GTIN</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Global Trade Item Number"
                                                    className="input input-bordered w-full"
                                                    value={formData.gtin || ""}
                                                    onChange={(e) => setFormData({ ...formData, gtin: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text text-base font-medium">MPN</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Manufacturer Part Number"
                                                    className="input input-bordered w-full"
                                                    value={formData.mpn || ""}
                                                    onChange={(e) => setFormData({ ...formData, mpn: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Gender & Age Group */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text text-base font-medium">Gender</span>
                                                </label>
                                                <select
                                                    className="select select-bordered w-full"
                                                    value={formData.gender || ""}
                                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                >
                                                    {GENDER_OPTIONS.map(option => (
                                                        <option key={option} value={option}>
                                                            {option || "Select"}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text text-base font-medium">Age Group</span>
                                                </label>
                                                <select
                                                    className="select select-bordered w-full"
                                                    value={formData.age_group || ""}
                                                    onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                                                >
                                                    {AGE_GROUP_OPTIONS.map(option => (
                                                        <option key={option} value={option}>
                                                            {option || "Select"}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        {/* Pattern */}
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-base font-medium">Pattern</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Striped"
                                                className="input input-bordered w-full"
                                                value={formData.pattern || ""}
                                                onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                                            />
                                        </div>

                                        {/* Size Type & System */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text text-base font-medium">Size Type</span>
                                                </label>
                                                <select
                                                    className="select select-bordered w-full"
                                                    value={formData.size_type || ""}
                                                    onChange={(e) => setFormData({ ...formData, size_type: e.target.value })}
                                                >
                                                    {SIZE_TYPE_OPTIONS.map(option => (
                                                        <option key={option} value={option}>
                                                            {option || "Select"}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text text-base font-medium">Size System</span>
                                                </label>
                                                <select
                                                    className="select select-bordered w-full"
                                                    value={formData.size_system || ""}
                                                    onChange={(e) => setFormData({ ...formData, size_system: e.target.value })}
                                                >
                                                    {SIZE_SYSTEM_OPTIONS.map(option => (
                                                        <option key={option} value={option}>
                                                            {option || "Select"}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Product Type */}
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-base font-medium">Product Type</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Electronics > Phones"
                                                className="input input-bordered w-full"
                                                value={formData.product_type || ""}
                                                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                                            />
                                        </div>

                                        {/* Tax */}
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text text-base font-medium">Tax Information</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., US:CA:9.5:y"
                                                className="input input-bordered w-full"
                                                value={formData.tax || ""}
                                                onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                                            />
                                        </div>

                                        {/* Additional Custom Labels */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {[1, 2, 3, 4].map(num => (
                                                <div className="form-control" key={num}>
                                                    <label className="label">
                                                        <span className="label-text text-base font-medium">Custom Label {num}</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder={`Label ${num}`}
                                                        className="input input-bordered w-full"
                                                        value={formData[`custom_label_${num}`] || ""}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            [`custom_label_${num}`]: e.target.value
                                                        })}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </details>


                            {/* Description Field */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-base font-medium">Description</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered h-32"
                                    placeholder="Product description..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            {/* Media Upload Section */}
                            <div className={`form-control ${formData.media.length === 0 ? 'border border-red-500 rounded-lg p-2' : ''}`}>
                                <label className="label">
                                    <span className="label-text text-base font-medium">Product Media (max 8)</span>
                                </label>
                                <div className="flex flex-wrap gap-4">
                                    {formData.media.map((media, index) => (
                                        media.markedForDeletion ? null : (
                                            <div key={media.id} className="relative group w-24 h-24">
                                                {media.mimeType?.startsWith('video/') || media.file?.type?.startsWith('video/') ? (
                                                    <video className="w-full h-full object-cover rounded-lg border">
                                                        <source src={media.mediaUrl || media.preview} type={media.mimeType || media.file?.type} />
                                                    </video>
                                                ) : (
                                                    <img
                                                        src={media.mediaUrl || media.preview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover rounded-lg border"
                                                    />
                                                )}
                                                {/* Mark the first image as thumbnail */}
                                                {index === 0 && (media.mimeType?.startsWith('image/') || media.file?.type?.startsWith('image/')) && (
                                                    <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded-tl">
                                                        Thumbnail
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMedia(media.id)}
                                                    className="btn btn-xs btn-circle absolute -top-2 -right-2 bg-error border-error hover:bg-error/80 text-white"
                                                >
                                                    <XIcon className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )
                                    ))}
                                    {formData.media.filter(m => !m.markedForDeletion).length < 8 && (
                                        <div className="w-24 h-24">
                                            <label
                                                htmlFor="media-upload"
                                                className={`btn btn-outline w-full h-full flex flex-col items-center justify-center cursor-pointer p-0 rounded-lg border-dashed hover:border-primary ${creatableAccess ? 'btn-disabled pointer-events-none opacity-75' : ''}`}
                                            >
                                                <PlusCircleIcon className="w-8 h-8 mb-1" />
                                                <span className="text-xs">Add Media</span>
                                            </label>
                                            <input
                                                id="media-upload"
                                                type="file"
                                                multiple
                                                accept="image/*, video/*"
                                                className="hidden"
                                                onChange={handleMediaUpload}
                                            />
                                        </div>
                                    )}
                                </div>
                                {formData.media.filter(m => !m.markedForDeletion).length === 0 && (
                                    <div className="text-red-500 text-sm mt-2">
                                        At least one media file is required
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-action">
                            <button
                                className="btn btn-error"
                                onClick={handleDelete}
                                disabled={deletableAccess}
                                type="button"
                            >
                                <Trash2Icon className="size-5 mr-2" />
                                Delete Product
                            </button>
                            <button
                                disabled={updatableAccess || (!formData.name || !formData.price || !formData.media || !formData.commerce_tax_category || (formData.media.filter(m => !m.markedForDeletion).length === 0) || !formData.inventoryQuantity || !formData.currency)}
                                type="submit"
                                className="btn btn-md btn-primary"
                            >
                                {loading ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : (
                                    <>
                                        <SaveIcon className="size-5 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProductPage3;
// import { ArrowLeftIcon, PlusCircleIcon, SaveIcon, Package2Icon, DollarSignIcon, ImageIcon, Trash2Icon, EditIcon, ChevronLeftIcon, ChevronRightIcon, TextIcon } from "lucide-react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useProductStore } from "../store/useProductStore";
// import { useEffect, useState, useRef } from "react";
// import { useGoogleAuthContext } from "../contexts/GoogleAuthContext";
// import {toast} from "react-hot-toast";
// import {privilegeAccess, createLogs} from "../funcs/essentialFuncs";

// function ProductPage3() {
//     const navigate = useNavigate();
//     const { id } = useParams();
//     const { fetchProduct, formData, loading, error, setFormData, product, deleteProduct, updateProduct, resetFormData } = useProductStore();
//     const [currentImageIndex, setCurrentImageIndex] = useState(0);
//     const [newImageUrl, setNewImageUrl] = useState("");
//     const [mediaToDelete, setMediaToDelete] = useState([]);
//     const timeoutRef = useRef(null);
//     const delayRef = useRef(3000);
//     const {gapi} = useGoogleAuthContext();
//     const {creatableAccess, deletableAccess, updatableAccess, readableAccess} = privilegeAccess();
//     const pageLoadedRef = useRef(false);

//     useEffect(() => {
//         fetchProduct(id, gapi);
//     }, [id, fetchProduct]);

//     useEffect(() => {
//         window.scrollTo(0, 0);
//         const pageLoaded = ()=>{
//             if(localStorage.getItem("passkey")){
//                 if(pageLoadedRef.current) return;
//                 const passkeyName = localStorage.getItem("passkeyName");
//                 createLogs("Accessed", `${passkeyName} entered the ${formData.name} Product Page`)
//                 pageLoadedRef.current = true;
//             }
//         }
//         pageLoaded();
//         return ()=>{};
//     }, []);

//     useEffect(() => {
//         const startTimeout = () => {
//             if (formData.media?.length > 1) {
//                 timeoutRef.current = setTimeout(() => {
//                     setCurrentImageIndex((prev) => (prev + 1) % formData.media.length);
//                     delayRef.current = 3000; // Reset to normal interval after automatic transition
//                 }, delayRef.current);
//             }
//         };

//         startTimeout();
//         return () => {
//             if (timeoutRef.current) clearTimeout(timeoutRef.current);
//         };
//     }, [currentImageIndex, formData.media]);

//     const handleUserInteraction = () => {
//         clearTimeout(timeoutRef.current);
//         delayRef.current = 5000; // Pause for 5 seconds after interaction
//     };

//     const handleDeleteImage = (index, blob) => {
//         const newImages = formData.media.filter((_, i) => i !== index);
//         setFormData({ ...formData, media: newImages });
        
//         if(blob?.operation !== "add" || !blob?.operation){
//             setMediaToDelete(prev=>[...prev, blob])
//         }

//         if (currentImageIndex >= newImages.length) {
//             setCurrentImageIndex(Math.max(0, newImages.length - 1));
//         }
//         handleUserInteraction();
//     };

//     const handleFileUpload = async (file, index, fileId=null) => {
//         if(formData.media.length >= 8){
//             toast.error("You can upload up to 8 media")
//             return
//         }

//         if(index !== undefined 
//             && (!formData.media[index]?.operation || formData.media[index]?.operation === "update")
//         ){
//             // Update existing image
//             const newMedia = [...formData.media];
//             newMedia[index] = {
//                 id: fileId,
//                 mediaUrl: URL.createObjectURL(file),
//                 mimeType: file.type,
//                 file: file,
//                 operation: "update"
//             };
//             setFormData({...formData, media: newMedia});
//         }else if(index !== undefined && (!formData.media[index]?.operation || formData.media[index]?.operation === "add")){
//             const newMedia = [...formData.media];
//             newMedia[index] = {
//                 id: fileId,
//                 mediaUrl: URL.createObjectURL(file),
//                 mimeType: file.type,
//                 file: file,
//                 operation: "add"
//             };
//             setFormData({...formData, media: newMedia});
//         }
//         else{
//             // Add new image
//             const freshMedia = {
//                 id: Math.random().toString(36).substr(2, 9),
//                 mediaUrl: URL.createObjectURL(file),
//                 mimeType: file.type,
//                 file: file,
//                 operation: "add"
//             };
            
//             setFormData({
//                 ...formData,
//                 media: [...formData.media, freshMedia]
//             })
//         }
//     };


//     const handleChangeImage = async (index, blobId) => {
//         const input = document.createElement('input');
//         input.type = 'file';
//         input.accept = 'image/*';
//         input.onchange = (e) => {
//             const file = e.target.files ? e.target.files[0] : undefined;
//             if (file) {
//                 handleFileUpload(file, index, blobId);
//                 handleUserInteraction();
//             }
//         };
//         input.click();
//     };

//     if (error) {
//         return (
//             <div className="container mx-auto px-4 py-8 max-w-4xl">
//                 <div className="alert alert-error">{error}</div>
//             </div>
//         );
//     }

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center min-h-screen">
//                 <div className="loading loading-spinner loading-lg" />
//             </div>
//         );
//     }

//     const handleDelete = async () => {
//         if (confirm("Are you sure you want to delete this product?")) {
//             await deleteProduct(id, gapi, product.mediaFolderId);
//             resetFormData();
//             navigate("/");
//         }
//     };

//     console.log({formData})

//     return (
//         <div className="container mx-auto px-4 py-8 max-w-4xl">
//             <button
//                 onClick={() => {
//                     resetFormData();
//                     navigate("/");
//                 }}
//                 className="btn btn-ghost mb-8"
//             >
//                 <ArrowLeftIcon className="size-5 mr-2" />
//                 Back to Products
//             </button>
//             <div className="md:min-h-[calc(100vh-20rem)] flex flex-col items-center justify-center">
//                 <div
//                     className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:min-h-[calc(100vh-60rem)]"
//                 >
//                     {/* Image Carousel */}
//                     <div className="relative rounded-box overflow-hidden shadow-lg aspect-square md:h-full md:aspect-auto">
//                         {formData.media?.length > 0 ? (
//                             <>
//                                 <div className="flex transition-transform duration-300 ease-in-out h-full"
//                                     style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
//                                     {formData.media.map((blob, index) => (
//                                         <div key={index} className="w-full flex-shrink-0 relative h-full">
//                                             <img src={blob.mediaUrl} id={blob.id} className="w-full h-full object-cover" alt={formData.name} />
//                                             {/* ... rest of carousel content ... */}
//                                             <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
//                                                 {index + 1}/{formData.media.length}
//                                             </div>
//                                             <div className="absolute top-4 right-4 flex gap-2">
//                                                 <button
//                                                     disabled={updatableAccess}
//                                                     onClick={() => handleChangeImage(index, blob.id)}
//                                                     className="btn btn-sm btn-circle btn-primary"
//                                                 >
//                                                     <EditIcon className="size-4" />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleDeleteImage(index, blob)}
//                                                     disabled={deletableAccess}
//                                                     className="btn btn-sm btn-circle btn-error"
//                                                 >
//                                                     <Trash2Icon className="size-4" />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                                 {/* ... navigation arrows ... */}
//                                 <button
//                                     onClick={() => {
//                                         handleUserInteraction();
//                                         setCurrentImageIndex(prev =>
//                                             (prev - 1 + formData.media.length) % formData.media.length
//                                         );
//                                     }}
//                                     className="btn btn-sm btn-circle btn-neutral absolute left-4 top-1/2 -translate-y-1/2"
//                                 >
//                                     <ChevronLeftIcon className="size-4" />
//                                 </button>
//                                 <button
//                                     onClick={() => {
//                                         handleUserInteraction();
//                                         setCurrentImageIndex(prev => (prev + 1) % formData.media.length);
//                                     }}
//                                     className="btn btn-sm btn-circle btn-neutral absolute right-4 top-1/2 -translate-y-1/2"
//                                 >
//                                     <ChevronRightIcon className="size-4" />
//                                 </button>
//                             </>
//                         ) : (
//                             <div className="w-full h-full bg-base-200 flex items-center justify-center">
//                                 <span className="text-base-content/50">No images</span>
//                             </div>
//                         )}
//                     </div>

//                     {/* Edit Card */}
//                     <div className="card bg-base-100 shadow-lg mt-4 md:mt-0">
//                         <div className="card-body h-full flex flex-col">
//                             <h2 className="card-title text-2xl mb-6">Edit Product</h2>
//                             <form className="flex-1 flex flex-col" onSubmit={(e) => {
//                                 e.preventDefault();
//                                 updateProduct(id, gapi, mediaToDelete);
//                             }}>
//                                 {/* ... form controls ... */}
//                                 <div className="form-control">
//                                     <label className="label">
//                                         <span className="label-text text-base font-medium">Product Name</span>
//                                     </label>
//                                     <div className="relative">
//                                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
//                                             <Package2Icon className="size-5" />
//                                         </div>
//                                         <input
//                                             disabled={updatableAccess}
//                                             value={formData?.name}
//                                             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                                             type="text"
//                                             placeholder="Enter product name"
//                                             className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors"
//                                         />
//                                     </div>
//                                 </div>
//                                 <div className="form-control">
//                                     <label className="label">
//                                         <span className="label-text text-base font-medium">Price</span>
//                                     </label>
//                                     <div className="relative">
//                                         <div className="absolute inset-y-0 left-0 -right-1 pl-3 flex items-center pointer-events-none text-base-content/50">
//                                             {formData?.currency}
//                                         </div>
//                                         <input
//                                             disabled={updatableAccess}
//                                             value={formData?.price}
//                                             onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//                                             type="number"
//                                             placeholder="0.00"
//                                             min="0"
//                                             step="0.01"
//                                             className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors"
//                                         />
//                                     </div>
//                                 </div>
//                                 <div className="form-control">
//                                     <label className="label">
//                                         <span className="label-text text-base font-medium">Description</span>
//                                     </label>
//                                     <div className="relative">
//                                         <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none text-base-content/50">
//                                             <TextIcon className="size-5" />
//                                         </div>
//                                         <textarea
//                                             disabled={updatableAccess}
//                                             value={formData?.description}
//                                             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                                             placeholder="Enter product description"
//                                             className="textarea textarea-bordered w-full pl-10 py-3 focus:textarea-primary transition-colors h-32"
//                                         />
//                                     </div>
//                                 </div>
//                                 <div className="form-control">
//                                     <label className="label">
//                                         <span className="label-text text-base font-medium">Upload Image</span>
//                                     </label>
//                                     <div className="flex gap-2">
//                                         <input
//                                             type="file"
//                                             accept="image/*"
//                                             onChange={(e) => {
//                                                 if (creatableAccess) return;
//                                                 const file = e.target.files?.[0];
//                                                 if (file) {
//                                                     handleFileUpload(file);
//                                                     handleUserInteraction();
//                                                 }
//                                             }}
//                                             className="hidden"
//                                             id="file-upload"
//                                             disabled={creatableAccess}
//                                         />
//                                         <label
//                                             htmlFor="file-upload"
//                                             className={`btn btn-primary w-full flex items-center justify-center gap-2 ${
//                                                 creatableAccess ? 'btn-disabled pointer-events-none opacity-75' : ''
//                                             }`}
//                                             aria-disabled={creatableAccess}
//                                         >
//                                             <PlusCircleIcon className="size-5" />
//                                             Upload Image
//                                         </label>
//                                     </div>
//                                 </div>
//                                 <div className="card-actions mt-auto pt-6 justify-center min-w-full">
//                                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-center min-w-full">
//                                         <button
//                                             className="btn btn-error min-w-full"
//                                             onClick={handleDelete}
//                                             disabled={deletableAccess}
//                                         >
//                                             <Trash2Icon className="size-5" />
//                                             Delete Product
//                                         </button>
//                                         <button
//                                             disabled={updatableAccess ||(!formData?.name || !formData?.price || !formData?.description || formData.media?.length === 0)}
//                                             type="submit"
//                                             className="btn btn-md btn-primary min-w-full"
//                                         >
//                                             <SaveIcon className="size-5 mr-2" />
//                                             Save Changes
//                                         </button>
//                                     </div>
//                                     {/* ... action buttons ... */}
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default ProductPage3;