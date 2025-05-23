import { ArrowLeftIcon, PlusCircleIcon, SaveIcon, Package2Icon, DollarSignIcon, ImageIcon, Trash2Icon, EditIcon, ChevronLeftIcon, ChevronRightIcon, TextIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import { useEffect, useState, useRef } from "react";
import { useGoogleAuthContext } from "../contexts/GoogleAuthContext";
import {toast} from "react-hot-toast";
import {privilegeAccess, createLogs} from "../funcs/essentialFuncs";

function ProductPage3() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { fetchProduct, formData, loading, error, setFormData, product, deleteProduct, updateProduct, resetFormData } = useProductStore();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [newImageUrl, setNewImageUrl] = useState("");
    const [mediaToDelete, setMediaToDelete] = useState([]);
    const timeoutRef = useRef(null);
    const delayRef = useRef(3000);
    const {gapi} = useGoogleAuthContext();
    const {creatableAccess, deletableAccess, updatableAccess, readableAccess} = privilegeAccess();
    const pageLoadedRef = useRef(false);

    useEffect(() => {
        fetchProduct(id, gapi);
    }, [id, fetchProduct]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const pageLoaded = ()=>{
            if(localStorage.getItem("passkey")){
                if(pageLoadedRef.current) return;
                const passkeyName = localStorage.getItem("passkeyName");
                createLogs("Accessed", `${passkeyName} entered the ${product.name} Product Page`)
                pageLoadedRef.current = true;
            }
        }
        pageLoaded();
        return ()=>{};
    }, []);

    useEffect(() => {
        const startTimeout = () => {
            if (formData.media?.length > 1) {
                timeoutRef.current = setTimeout(() => {
                    setCurrentImageIndex((prev) => (prev + 1) % formData.media.length);
                    delayRef.current = 3000; // Reset to normal interval after automatic transition
                }, delayRef.current);
            }
        };

        startTimeout();
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [currentImageIndex, formData.media]);

    const handleUserInteraction = () => {
        clearTimeout(timeoutRef.current);
        delayRef.current = 5000; // Pause for 5 seconds after interaction
    };

    const handleDeleteImage = (index, blob) => {
        const newImages = formData.media.filter((_, i) => i !== index);
        setFormData({ ...formData, media: newImages });
        
        if(blob?.operation !== "add" || !blob?.operation){
            setMediaToDelete(prev=>[...prev, blob])
        }

        if (currentImageIndex >= newImages.length) {
            setCurrentImageIndex(Math.max(0, newImages.length - 1));
        }
        handleUserInteraction();
    };

    const handleFileUpload = async (file, index, fileId=null) => {
        if(formData.media.length >= 8){
            toast.error("You can upload up to 8 media")
            return
        }

        if(index !== undefined 
            && (!formData.media[index]?.operation || formData.media[index]?.operation === "update")
        ){
            // Update existing image
            const newMedia = [...formData.media];
            newMedia[index] = {
                id: fileId,
                mediaUrl: URL.createObjectURL(file),
                mimeType: file.type,
                file: file,
                operation: "update"
            };
            setFormData({...formData, media: newMedia});
        }else if(index !== undefined && (!formData.media[index]?.operation || formData.media[index]?.operation === "add")){
            const newMedia = [...formData.media];
            newMedia[index] = {
                id: fileId,
                mediaUrl: URL.createObjectURL(file),
                mimeType: file.type,
                file: file,
                operation: "add"
            };
            setFormData({...formData, media: newMedia});
        }
        else{
            // Add new image
            const freshMedia = {
                id: Math.random().toString(36).substr(2, 9),
                mediaUrl: URL.createObjectURL(file),
                mimeType: file.type,
                file: file,
                operation: "add"
            };
            
            setFormData({
                ...formData,
                media: [...formData.media, freshMedia]
            })
        }
    };


    const handleChangeImage = async (index, blobId) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files ? e.target.files[0] : undefined;
            if (file) {
                handleFileUpload(file, index, blobId);
                handleUserInteraction();
            }
        };
        input.click();
    };

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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
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
            <div className="md:min-h-[calc(100vh-20rem)] flex flex-col items-center justify-center">
                <div
                    className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:min-h-[calc(100vh-60rem)]"
                >
                    {/* Image Carousel */}
                    <div className="relative rounded-box overflow-hidden shadow-lg aspect-square md:h-full md:aspect-auto">
                        {formData.media?.length > 0 ? (
                            <>
                                <div className="flex transition-transform duration-300 ease-in-out h-full"
                                    style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
                                    {formData.media.map((blob, index) => (
                                        <div key={index} className="w-full flex-shrink-0 relative h-full">
                                            <img src={blob.mediaUrl} id={blob.id} className="w-full h-full object-cover" alt={formData.name} />
                                            {/* ... rest of carousel content ... */}
                                            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                                {index + 1}/{formData.media.length}
                                            </div>
                                            <div className="absolute top-4 right-4 flex gap-2">
                                                <button
                                                    disabled={updatableAccess}
                                                    onClick={() => handleChangeImage(index, blob.id)}
                                                    className="btn btn-sm btn-circle btn-primary"
                                                >
                                                    <EditIcon className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteImage(index, blob)}
                                                    disabled={deletableAccess}
                                                    className="btn btn-sm btn-circle btn-error"
                                                >
                                                    <Trash2Icon className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* ... navigation arrows ... */}
                                <button
                                    onClick={() => {
                                        handleUserInteraction();
                                        setCurrentImageIndex(prev =>
                                            (prev - 1 + formData.media.length) % formData.media.length
                                        );
                                    }}
                                    className="btn btn-sm btn-circle btn-neutral absolute left-4 top-1/2 -translate-y-1/2"
                                >
                                    <ChevronLeftIcon className="size-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        handleUserInteraction();
                                        setCurrentImageIndex(prev => (prev + 1) % formData.media.length);
                                    }}
                                    className="btn btn-sm btn-circle btn-neutral absolute right-4 top-1/2 -translate-y-1/2"
                                >
                                    <ChevronRightIcon className="size-4" />
                                </button>
                            </>
                        ) : (
                            <div className="w-full h-full bg-base-200 flex items-center justify-center">
                                <span className="text-base-content/50">No images</span>
                            </div>
                        )}
                    </div>

                    {/* Edit Card */}
                    <div className="card bg-base-100 shadow-lg mt-4 md:mt-0">
                        <div className="card-body h-full flex flex-col">
                            <h2 className="card-title text-2xl mb-6">Edit Product</h2>
                            <form className="flex-1 flex flex-col" onSubmit={(e) => {
                                e.preventDefault();
                                updateProduct(id, gapi, mediaToDelete);
                            }}>
                                {/* ... form controls ... */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text text-base font-medium">Product Name</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                                            <Package2Icon className="size-5" />
                                        </div>
                                        <input
                                            disabled={updatableAccess}
                                            value={formData?.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            type="text"
                                            placeholder="Enter product name"
                                            className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors"
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
                                            disabled={updatableAccess}
                                            value={formData?.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            type="number"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text text-base font-medium">Description</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none text-base-content/50">
                                            <TextIcon className="size-5" />
                                        </div>
                                        <textarea
                                            disabled={updatableAccess}
                                            value={formData?.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Enter product description"
                                            className="textarea textarea-bordered w-full pl-10 py-3 focus:textarea-primary transition-colors h-32"
                                        />
                                    </div>
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text text-base font-medium">Upload Image</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (creatableAccess) return;
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    handleFileUpload(file);
                                                    handleUserInteraction();
                                                }
                                            }}
                                            className="hidden"
                                            id="file-upload"
                                            disabled={creatableAccess}
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className={`btn btn-primary w-full flex items-center justify-center gap-2 ${
                                                creatableAccess ? 'btn-disabled pointer-events-none opacity-75' : ''
                                            }`}
                                            aria-disabled={creatableAccess}
                                        >
                                            <PlusCircleIcon className="size-5" />
                                            Upload Image
                                        </label>
                                    </div>
                                </div>
                                <div className="card-actions mt-auto pt-6 justify-center min-w-full">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-center min-w-full">
                                        <button
                                            className="btn btn-error min-w-full"
                                            onClick={handleDelete}
                                            disabled={deletableAccess}
                                        >
                                            <Trash2Icon className="size-5" />
                                            Delete Product
                                        </button>
                                        <button
                                            disabled={updatableAccess ||(!formData?.name || !formData?.price || !formData?.description || formData.media?.length === 0)}
                                            type="submit"
                                            className="btn btn-md btn-primary min-w-full"
                                        >
                                            <SaveIcon className="size-5 mr-2" />
                                            Save Changes
                                        </button>
                                    </div>
                                    {/* ... action buttons ... */}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductPage3;