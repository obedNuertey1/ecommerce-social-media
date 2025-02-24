import { ArrowLeftIcon, PlusCircleIcon, Package2Icon, DollarSignIcon, ImageIcon, Trash2Icon, EditIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import {useEffect} from "react";

function ProductPage(){
    const navigate = useNavigate();
    const {id} = useParams();
    const {fetchProduct, formData, loading, error, setFormData, product, deleteProduct, updateProduct, resetFormData} = useProductStore();
    useEffect(()=>{
        fetchProduct(id);
    }, [id, fetchProduct]);

    useEffect(()=>{
        window.scrollTo(0, 0);
    },[])

    if(error){
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="alert alert-error">{error}</div>
            </div>
        )
    }

    if(loading){
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    const handleDelete = async ()=>{
        if(confirm("Are you sure you want to delete this product?")){
            await deleteProduct(id);
            navigate("/");
        }
    }
    
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <button
            onClick={()=>{
                resetFormData();
                navigate("/")
            }}
            className="btn btn-ghost mb-8">
                <ArrowLeftIcon className="size-5 mr-2"
                />
                Back to Products
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="rounded overflow-hidden shadow-lg aspect-square size-full md:aspect-auto min-h-[26rem] lg:max-h-[30rem]">
                    <img className="size-full object-cover" alt={product?.name} src={product?.image} />
                </div>
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-6">Edit Product</h2>
                        <form onSubmit={(e)=>{
                            e.preventDefault();
                            updateProduct(id);
                        }}>
                            {/* <div className="grid gap-3"> */}
                                {/* Product Name */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text text-base font-mediumn" >Product Name</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
                                            <Package2Icon className="size-5" />
                                        </div>
                                        <input 
                                        value={formData?.name}
                                        onChange={(e)=>setFormData({...formData, name: e.target.value})}
                                        type="text" placeholder="Enter product name" className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors" />
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
                                        <input
                                        value={formData?.price}
                                        onChange={(e)=>setFormData({...formData, price: e.target.value})}
                                        type="number" placeholder="0.00" 
                                        min="0"
                                        step="0.01"
                                        className="input 
                                        input-bordered w-full pl-10 py-3 focus:input-primary transition-colors" />
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
                                        <input
                                        value={formData?.image}
                                        onChange={(e)=>setFormData({...formData, image: e.target.value})}
                                        type="text" placeholder="https://example.com/image.jpg" 
                                        className="input input-bordered w-full pl-10 py-3 focus:input-primary transition-colors" />
                                    </div>
                                </div>
                            {/* </div> */}
                            {/* <div className="form-control"> */}
                                <div className="card-actions mt-4 justify-center min-w-full">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 items-center min-w-full">

                                        <button className="btn btn-error min-w-full"
                                        onClick={handleDelete}
                                        >
                                            <Trash2Icon className="size-5" />
                                            Delete Product</button>
                                        <button disabled={!formData?.name || !formData?.price || !formData?.image} type="submit" className="btn btn-md btn-primary min-w-full">
                                            <EditIcon className="size-5 mr-2" />
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            {/* </div> */}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductPage;