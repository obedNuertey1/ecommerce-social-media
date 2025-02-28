import { ArrowLeftIcon, PlusCircleIcon, Package2Icon, DollarSignIcon, ImageIcon, Trash2Icon, EditIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import { useEffect, useState, useRef } from "react";

function ProductPage2() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { fetchProduct, formData, loading, error, setFormData, product, deleteProduct, updateProduct, resetFormData } = useProductStore();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [newImageUrl, setNewImageUrl] = useState("");
    const timeoutRef = useRef(null);

    useEffect(() => {
        fetchProduct(id);
    }, [id, fetchProduct]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        // Auto-rotate carousel every 3 seconds
        const startTimeout = () => {
            if (formData.media?.length > 1) {
                timeoutRef.current = setTimeout(() => {
                    setCurrentImageIndex((prev) => (prev + 1) % formData.media.length);
                }, 3000);
            }
        };

        startTimeout();
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [currentImageIndex, formData.media]);

    const handleDeleteImage = (index) => {
        const newImages = formData.media.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages });
        
        if (currentImageIndex >= newImages.length) {
            setCurrentImageIndex(Math.max(0, newImages.length - 1));
        }
    };

    const handleChangeImage = (index) => {
        const newUrl = prompt("Enter new image URL:", formData.media[index]);
        if (newUrl) {
            const newImages = [...formData.media];
            newImages[index] = newUrl;
            setFormData({ ...formData, images: newImages });
        }
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
            await deleteProduct(id);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative rounded-box overflow-hidden shadow-lg aspect-square size-full md:aspect-auto min-h-[26rem] lg:max-h-[30rem]">
                    {formData.media?.length > 0 ? (
                        <>
                            <div className="flex transition-transform duration-300 ease-in-out"
                                style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
                                {formData.media.map((image, index) => (
                                    <div key={index} className="w-full flex-shrink-0 relative">
                                        <img src={image} className="w-full h-full object-cover" alt={formData.name} />
                                        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                            {index + 1}/{formData.media.length}
                                        </div>
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button
                                                onClick={() => handleChangeImage(index)}
                                                className="btn btn-sm btn-circle btn-primary"
                                            >
                                                <EditIcon className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteImage(index)}
                                                className="btn btn-sm btn-circle btn-error"
                                            >
                                                <Trash2Icon className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-base-200 flex items-center justify-center">
                            <span className="text-base-content/50">No images</span>
                        </div>
                    )}
                </div>
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-6">Edit Product</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            updateProduct(id);
                        }}>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-base font-medium">Product Name</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                                        <Package2Icon className="size-5" />
                                    </div>
                                    <input
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
                                    <span className="label-text text-base font-medium">Add Image URL</span>
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-grow">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                                            <ImageIcon className="size-5" />
                                        </div>
                                        <input
                                            value={newImageUrl}
                                            onChange={(e) => setNewImageUrl(e.target.value)}
                                            type="text"
                                            placeholder="https://example.com/image.jpg"
                                            className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (newImageUrl) {
                                                setFormData({ ...formData, images: [...formData.media, newImageUrl] });
                                                setNewImageUrl("");
                                            }
                                        }}
                                        className="btn btn-primary"
                                    >
                                        <PlusCircleIcon className="size-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="card-actions mt-4 justify-center min-w-full">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-center min-w-full">
                                    <button
                                        className="btn btn-error min-w-full"
                                        onClick={handleDelete}
                                    >
                                        <Trash2Icon className="size-5" />
                                        Delete Product
                                    </button>
                                    <button
                                        disabled={!formData?.name || !formData?.price || formData.media?.length === 0}
                                        type="submit"
                                        className="btn btn-md btn-primary min-w-full"
                                    >
                                        <EditIcon className="size-5 mr-2" />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductPage2;