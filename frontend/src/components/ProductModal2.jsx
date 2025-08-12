import { PlusCircleIcon, Package2Icon, DollarSignIcon, ImageIcon, XIcon } from "lucide-react";
import { useProductStore } from "../store/useProductStore";
import { useCallback, useEffect, useState } from "react";
import { useGoogleAuthContext } from "../contexts/GoogleAuthContext";
import { getProductCatalogs } from "../funcs/socialCrudFuncs";

const token = import.meta.env.VITE_FACEBOOK_LONG_LIVED_TOKEN;

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

function ProductModal2() {
    const { addProduct, formData, setFormData, resetFormData, loading } = useProductStore();
    const { gapi } = useGoogleAuthContext();

    // NEW STATE FOR CATALOGUES
    const [catalogues, setCatalogues] = useState([]);
    const [loadingCatalogues, setLoadingCatalogues] = useState(false);

    // Initialize formData with default values
    useEffect(() => {
        setFormData({
            ...formData,
            currency: formData.currency || "USD",
            availability: formData.availability || "in stock",
            condition: formData.condition || "new",
            shipping_weight_unit: formData.shipping_weight_unit || "lb"
        });
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
        const files = Array.from(e.target.files);
        const remainingSlots = 8 - formData.media.length;
        const newFiles = files.slice(0, remainingSlots).map(file => ({
            file,
            preview: URL.createObjectURL(file),
            id: Math.random().toString(36).substr(2, 9)
        }));

        setFormData({
            ...formData,
            media: [...formData.media, ...newFiles]
        });

        // Reset the input so the same file can be selected again if needed
        e.target.value = "";
    }, [formData, setFormData]);

    const handleRemoveMedia = useCallback((mediaId) => {
        const mediaToRemove = formData.media.find(m => m.id === mediaId);
        if (mediaToRemove) URL.revokeObjectURL(mediaToRemove.preview);

        setFormData({
            ...formData,
            media: formData.media.filter(m => m.id !== mediaId)
        });
    }, [formData, setFormData]);

    return (
        <dialog id="my_modal_2" className="modal">
            <div className="modal-box max-h-[90vh] overflow-y-auto">
                <form method="dialog">
                    <button onClick={resetFormData} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 className="font-bold text-lg mb-8">Add New Product</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    addProduct(gapi);
                }} className="space-y-6">
                    <div className="grid gap-6">
                        {/* NEW CATALOGUE SECTION */}
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
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                                                <DollarSignIcon className="size-5" />
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors"
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
                                        >
                                            {CURRENCIES.map(currency => (
                                                <option key={currency} value={currency}>
                                                    {currency}
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
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-base font-medium">Product Media (max 8)</span>
                            </label>
                            <div className="flex flex-wrap gap-4">
                                {formData.media.map((media, index) => (
                                    <div key={media.id} className="relative group w-24 h-24">
                                        {media.file.type.startsWith('video/') ? (
                                            <video className="w-full h-full object-cover rounded-lg border">
                                                <source src={media.preview} type={media.file.type} />
                                            </video>
                                        ) : (
                                            <img
                                                src={media.preview}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-lg border"
                                            />
                                        )}
                                        {/* Mark the first image as thumbnail */}
                                        {index === 0 && media.file.type.startsWith('image/') && (
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
                                ))}
                                {formData.media.length < 8 && (
                                    <div className="w-24 h-24">
                                        <label
                                            htmlFor="media-upload"
                                            className="btn btn-outline w-full h-full flex flex-col items-center justify-center cursor-pointer p-0 rounded-lg border-dashed hover:border-primary"
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
                        </div>
                    </div>

                    <div className="modal-action">
                        <form method="dialog">
                            <button onClick={resetFormData} className="btn btn-ghost">Cancel</button>
                        </form>
                        <button
                            disabled={!formData.name || !formData.price || !formData.media}
                            type="submit"
                            className="btn btn-md btn-primary"
                        >
                            {loading ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <>
                                    <PlusCircleIcon className="size-5 mr-2" />
                                    Add Product
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={resetFormData}>close</button>
            </form>
        </dialog>
    );
}

export default ProductModal2;