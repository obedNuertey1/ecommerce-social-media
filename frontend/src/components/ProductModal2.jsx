import { PlusCircleIcon, Package2Icon, DollarSignIcon, ImageIcon, XIcon } from "lucide-react";
import { useProductStore } from "../store/useProductStore";
import { useCallback } from "react";
import { useGoogleAuthContext } from "../contexts/GoogleAuthContext";

function ProductModal2() {
    const { addProduct, formData, setFormData, resetFormData, loading } = useProductStore();
    const {gapi} = useGoogleAuthContext();

    //     // NEW STATE FOR CATALOGUES
    // const [catalogues, setCatalogues] = useState([]);
    // const [loadingCatalogues, setLoadingCatalogues] = useState(false);

    // // NEW: FETCH CATALOGUES WHEN COMPONENT LOADS
    // useEffect(() => {
    //     const fetchCatalogues = async () => {
    //         if (gapi) {
    //             try {
    //                 setLoadingCatalogues(true);
    //                 const token = gapi.auth.getToken()?.access_token;
    //                 if (token) {
    //                     const catalogList = await getProductCatalogs(token);
    //                     setCatalogues(catalogList);
    //                 }
    //             } catch (error) {
    //                 console.error("Failed to fetch catalogues:", error);
    //             } finally {
    //                 setLoadingCatalogues(false);
    //             }
    //         }
    //     };
        
    //     fetchCatalogues();
    // }, [gapi]);

    // // NEW: HANDLE CATALOGUE SELECTION
    // const handleCatalogueChange = useCallback((e) => {
    //     const { value } = e.target;
    //     setFormData({
    //         ...formData,
    //         catalogueId: value === "new" ? "" : value,
    //         isNewCatalogue: value === "new"
    //     });
    // }, [formData, setFormData]);

    const handleMediaUpload = useCallback((e) => {
        const files = Array.from(e.target.files);
        // console.log("Array.from(e.target.files)=",files)
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
    // console.log({formData})

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
            <div className="modal-box">
                <form method="dialog">
                    <button onClick={resetFormData} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 className="font-bold text-lg mb-8">Add New Product</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    addProduct(gapi);
                }} className="space-y-6">
                    <div className="grid gap-6">
                        {/* Existing fields */}
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

                        {/* New Description Field */}
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
