// PartnerProductUpload.jsx
import { useState, useEffect, useCallback } from 'react';
import {
    Package2Icon,
    DollarSignIcon,
    ImageIcon,
    XIcon,
    MapPinIcon,
    PlusCircleIcon
} from "lucide-react";
import { toast } from 'react-hot-toast';

const PartnerProductUpload = () => {
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        media: [],
        currency: "USD",
        brand: "",
        category: "",
        condition: "new",
        latitude: "",
        longitude: ""
    });

    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(true);
    const [locationError, setLocationError] = useState("");

    // Get user's location on component mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }));
                    setLocationLoading(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationError("Unable to get your location. Please ensure location services are enabled.");
                    setLocationLoading(false);

                    // Fallback to IP-based location
                    fetch('https://ipapi.co/json/')
                        .then(res => res.json())
                        .then(data => {
                            setFormData(prev => ({
                                ...prev,
                                latitude: data.latitude,
                                longitude: data.longitude
                            }));
                        })
                        .catch(err => {
                            console.error("IP-based location also failed:", err);
                        });
                },
                { timeout: 10000 }
            );
        } else {
            setLocationError("Geolocation is not supported by this browser.");
            setLocationLoading(false);
        }
    }, []);

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

        e.target.value = "";
    }, [formData]);

    const handleRemoveMedia = useCallback((mediaId) => {
        const mediaToRemove = formData.media.find(m => m.id === mediaId);
        if (mediaToRemove) URL.revokeObjectURL(mediaToRemove.preview);

        setFormData({
            ...formData,
            media: formData.media.filter(m => m.id !== mediaId)
        });
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Here you would integrate with your API to submit the product
            // along with the location data (formData.latitude, formData.longitude)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            toast.success("Product uploaded successfully!");

            // Reset form
            setFormData({
                name: "",
                price: "",
                description: "",
                media: [],
                currency: "USD",
                brand: "",
                category: "",
                condition: "new",
                latitude: "",
                longitude: ""
            });
        } catch (error) {
            console.error("Error uploading product:", error);
            toast.error("Failed to upload product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-6">Upload Product</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Location Information */}
                        <div className="bg-base-200 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                                <MapPinIcon className="w-5 h-5 mr-2 text-primary" />
                                <h3 className="font-semibold">Store Location</h3>
                            </div>

                            {locationLoading ? (
                                <div className="flex items-center">
                                    <span className="loading loading-spinner loading-sm mr-2"></span>
                                    <span>Detecting your location...</span>
                                </div>
                            ) : locationError ? (
                                <div className="text-error text-sm">{locationError}</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Latitude</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered"
                                            value={formData.latitude}
                                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Longitude</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered"
                                            value={formData.longitude}
                                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Product Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Product Name</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                                            <Package2Icon className="size-5" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Enter product name"
                                            className="input input-bordered w-full pl-10"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Price</span>
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
                                                className="input input-bordered w-full pl-10"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Currency</span>
                                        </label>
                                        <select
                                            className="select select-bordered"
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            required
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="GHS">GHS</option>
                                            {/* Add more currencies as needed */}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Brand</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Samsung"
                                        className="input input-bordered w-full"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Category</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Electronics/Phones"
                                        className="input input-bordered w-full"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Condition</span>
                                    </label>
                                    <select
                                        className="select select-bordered"
                                        value={formData.condition}
                                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                    >
                                        <option value="new">New</option>
                                        <option value="refurbished">Refurbished</option>
                                        <option value="used">Used</option>
                                    </select>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Description</span>
                                    </label>
                                    <textarea
                                        className="textarea textarea-bordered h-32"
                                        placeholder="Product description..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Media Upload Section */}
                        <div className={`form-control ${formData.media.length === 0 ? 'border border-error rounded-lg p-4' : ''}`}>
                            <label className="label">
                                <span className="label-text">Product Images (max 8)</span>
                            </label>
                            <div className="flex flex-wrap gap-4">
                                {formData.media.map((media) => (
                                    <div key={media.id} className="relative group w-24 h-24">
                                        <img
                                            src={media.preview}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-lg border"
                                        />
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
                                            <span className="text-xs">Add Image</span>
                                        </label>
                                        <input
                                            id="media-upload"
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleMediaUpload}
                                        />
                                    </div>
                                )}
                            </div>
                            {formData.media.length === 0 && (
                                <div className="text-error text-sm mt-2">
                                    At least one image is required
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end mt-8">
                            <button
                                type="submit"
                                disabled={loading || !formData.name || !formData.price || formData.media.length === 0 || !formData.latitude || !formData.longitude}
                                className="btn btn-primary"
                            >
                                {loading ? (
                                    <span className="loading loading-spinner"></span>
                                ) : (
                                    <>
                                        <Package2Icon className="w-5 h-5 mr-2" />
                                        Upload Product
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PartnerProductUpload;