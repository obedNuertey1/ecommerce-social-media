import { PlusCircleIcon, Package2Icon, DollarSignIcon, ImageIcon } from "lucide-react";
import { useProductStore } from "../store/useProductStore";

function ProductModal(){
    const {addProduct, formData, setFormData, resetFormData, loading} = useProductStore();
    return (
        <dialog id="my_modal_2" className="modal">
            <div className="modal-box">
                <form method="dialog">
                    {/* if there is a button in form, it will close the modal */}
                    <button onClick={resetFormData} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h3 className="font-bold text-lg mb-8">Add New Product</h3>
                <form onSubmit={(e)=>{
                    e.preventDefault();
                    addProduct();
                }} className="space-y-6">
                    <div className="grid gap-6">
                        {/* Product Name */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-base font-mediumn" >Product Name</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                                    <Package2Icon className="size-5" />
                                </div>
                                <input type="text" placeholder="Enter product name" className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors"
                                value={formData.name}
                                onChange={(e)=>
                                    setFormData({...formData, name: e.target.value})
                                }
                                 />
                            </div>
                        </div>
                        {/* Product Price */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-base font-mediumn" >Price</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                                    <DollarSignIcon className="size-5" />
                                </div>
                                <input type="number" placeholder="0.00" 
                                min="0"
                                step="0.01"
                                className="input 
                                input-bordered w-full pl-10 py-3 focus:input-primary transition-colors" 
                                value={formData.price}
                                onChange={(e)=>setFormData({...formData, price: e.target.value})}
                                />
                            </div>
                        </div>
                        {/* Image URL */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-base font-mediumn" >Image URL</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                                    <ImageIcon className="size-5" />
                                </div>
                                <input type="text" placeholder="https://example.com/image.jpg" 
                                className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors"
                                value={formData.image}
                                onChange={(e)=>setFormData({...formData, image: e.target.value})}
                                 />
                            </div>
                        </div>
                    </div>
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button, it will close the modal */}
                            <button onClick={resetFormData} className="btn btn-ghost">Cancel</button>
                        </form>
                        <button disabled={!formData.name || !formData.price || !formData.image} type="submit" className="btn btn-md btn-primary">
                            {
                                loading ? (<span className="loading loading-spinner loading-sm" />): (
                                    <PlusCircleIcon className="size-5 mr-2" />
                                )
                            }
                            Add Product
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

export default ProductModal;