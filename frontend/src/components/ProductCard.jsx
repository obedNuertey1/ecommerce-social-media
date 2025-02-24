import { EditIcon, Trash2Icon } from "lucide-react";
import {Link} from "react-router-dom";
import {useProductStore} from "../store/useProductStore";
function ProductCard({product}){
    const {deleteProduct} = useProductStore();
    return (
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <figure 
            className="relative pt-[56.25%]"
            >
                <img
                src={product.image}
                alt={product.name} 
                className="absolute top-0 left-0 w-full h-full object-cover" 
                />
            </figure>
            <div className="card-body">
                <h2 className="card-title">
                    {product.name}
                </h2>
                <p className="text-2xl font-bold text-primary">${product.price}</p>
                <div className="card-actions justify-end">
                    <Link to={`/product/${product.id}`} className="btn btn-info btn-sm btn-outline">
                        <EditIcon className="size-5" />
                    </Link>
                    <button 
                    onClick={()=>deleteProduct(product.id)}
                    className="btn btn-error btn-sm btn-outline">
                        <Trash2Icon className="size-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;