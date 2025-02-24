import { PlusCircleIcon, RefreshCwIcon, PackageIcon } from "lucide-react";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import {useProductStore} from "../store/useProductStore";
import {useEffect} from "react";

function HomePage(){
    const {fetchProducts, loading, error, products} = useProductStore();
    useEffect(()=>{
        fetchProducts();
    },[fetchProducts])
    return (
        <>
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={()=>document.getElementById('my_modal_2').showModal()}
                    className="btn btn-primary">
                        <PlusCircleIcon className="size-5 mr-2" />
                        Add Product
                    </button>
                    <button
                     onClick={()=>{
                        fetchProducts();
                        console.log("refresh works")
                     }}
                     className="btn btn-ghost btn-circle">
                        <RefreshCwIcon className="size-5" />
                    </button>
                </div>
                {error && <div className="alert alert-error mb-8">{error}</div>}

                {(products.length === 0 && loading === false && error === null) && (
                    <div className="flex flex-col justify-center items-center h-96 space-y-4">
                        <div className="bg-base-100 rounded-full p-6">
                            <PackageIcon className="size-12" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-semibold">No products found</h3>
                            <p className="text-base-content/50 max-w-sm">
                                Get started by adding your first product to the inventory
                            </p>
                        </div>
                    </div>
                )}
                {loading ? (<div className="flex h-64 flex-col items-center justify-center">
                    <div className="loading loading-spinner loading-lg"></div></div>):(<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((elem, i)=><ProductCard key={i} product={elem} />)}
                </div>)
                    }
            </main>
            <ProductModal />
        </>
    )
}

export default HomePage;