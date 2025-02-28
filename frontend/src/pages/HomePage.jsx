// import { PlusCircleIcon, RefreshCwIcon, PackageIcon } from "lucide-react";
// import ProductCard from "../components/ProductCard";
// import ProductModal from "../components/ProductModal";
// import ProductModal2 from "../components/ProductModal2";
// import {useProductStore} from "../store/useProductStore";
// import {useEffect} from "react";

// function HomePage(){
//     const {fetchProducts, loading, error, products} = useProductStore();
//     useEffect(()=>{
//         fetchProducts();
//     },[fetchProducts])
//     return (
//         <>
//             <main className="max-w-6xl mx-auto px-4 py-8">
//                 <div className="flex items-center justify-between mb-8">
//                     <button
//                         onClick={()=>document.getElementById('my_modal_2').showModal()}
//                     className="btn btn-primary">
//                         <PlusCircleIcon className="size-5 mr-2" />
//                         Add Product
//                     </button>
//                     <button
//                      onClick={()=>{
//                         fetchProducts();
//                         console.log("refresh works")
//                      }}
//                      className="btn btn-ghost btn-circle">
//                         <RefreshCwIcon className="size-5" />
//                     </button>
//                 </div>
//                 {error && <div className="alert alert-error mb-8">{error}</div>}

//                 {(products.length === 0 && loading === false && error === null) && (
//                     <div className="flex flex-col justify-center items-center h-96 space-y-4">
//                         <div className="bg-base-100 rounded-full p-6">
//                             <PackageIcon className="size-12" />
//                         </div>
//                         <div className="text-center space-y-2">
//                             <h3 className="text-2xl font-semibold">No products found</h3>
//                             <p className="text-base-content/50 max-w-sm">
//                                 Get started by adding your first product to the inventory
//                             </p>
//                         </div>
//                     </div>
//                 )}
//                 {loading ? (<div className="flex h-64 flex-col items-center justify-center">
//                     <div className="loading loading-spinner loading-lg"></div></div>):(<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {products.map((elem, i)=><ProductCard key={i} product={elem} />)}
//                 </div>)
//                     }
//             </main>
//             <ProductModal2 />
//         </>
//     )
// }

// export default HomePage;
import { PlusCircleIcon, RefreshCwIcon, PackageIcon, SearchIcon } from "lucide-react";
import ProductCard from "../components/ProductCard";
import ProductModal2 from "../components/ProductModal2";
import { useProductStore } from "../store/useProductStore";
import { useEffect, useState } from "react";

function HomePage() {
    const { fetchProducts, loading, error, products } = useProductStore();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
                    <button
                        onClick={() => document.getElementById('my_modal_2').showModal()}
                        className="btn btn-primary"
                    >
                        <PlusCircleIcon className="size-5 mr-0 md:mr-2" />
                        <span className="hidden md:inline">Add Product</span>
                    </button>
                    
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="input input-bordered w-full pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <SearchIcon className="absolute left-3 top-3.5 size-5 text-base-content/50" />
                    </div>

                    <button
                        onClick={() => {
                            fetchProducts();
                            setSearchTerm("");
                        }}
                        className="btn btn-ghost btn-circle"
                    >
                        <RefreshCwIcon className="size-5" />
                    </button>
                </div>

                {error && <div className="alert alert-error mb-8">{error}</div>}

                {(filteredProducts.length === 0 && !loading && !error) && (
                    <div className="flex flex-col justify-center items-center h-96 space-y-4">
                        <div className="bg-base-100 rounded-full p-6">
                            <PackageIcon className="size-12" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-semibold">
                                {searchTerm ? "No matching products found" : "No products found"}
                            </h3>
                            <p className="text-base-content/50 max-w-sm">
                                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first product to the inventory"}
                            </p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex h-64 flex-col items-center justify-center">
                        <div className="loading loading-spinner loading-lg"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((elem, i) => (
                            <ProductCard key={i} product={elem} />
                        ))}
                    </div>
                )}
            </main>
            <ProductModal2 />
        </>
    )
}

export default HomePage;