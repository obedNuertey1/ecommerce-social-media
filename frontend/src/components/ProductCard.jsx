import { EditIcon, Trash2Icon, BarChart2Icon, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import { useRef, useEffect, useState } from "react";
import { useGoogleAuthContext } from "../contexts/GoogleAuthContext";
import {privilegeAccess} from "../funcs/essentialFuncs";

function ProductCard({ product }) {
    const { deleteProduct } = useProductStore();
    let randNumRef = useRef(null);
    const randNum = useState(Math.floor(Math.random() * 11))
    const { gapi } = useGoogleAuthContext();
    const {creatableAccess, deletableAccess, updatableAccess, readableAccess} = privilegeAccess();

    const analyticsIsActive = !localStorage.hasOwnProperty("passkey") ? false : (localStorage.hasOwnProperty("passkey") && JSON.parse(localStorage.getItem("accessiblePages")).includes("analytics")) ? false : true;
    const chatIsActive = !localStorage.hasOwnProperty("passkey") ? false : (localStorage.hasOwnProperty("passkey") && JSON.parse(localStorage.getItem("accessiblePages")).includes("chat")) ? false : true;

    // console.log({creatableAccess, deletableAccess, updatableAccess, readableAccess});

    useEffect(() => {
        if (randNumRef.current) {
            const randomValue = Math.floor(Math.random() * 11);
            randNumRef.current.value = 56;
        }
    }, []);
    return (
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <figure
                className="relative pt-[56.25%]"
            >
                <img
                    src={product.image.mediaUrl}
                    id={product.image.id}
                    alt={product.name}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                />
            </figure>
            <div className="card-body">
                <h2 className="card-title">
                    {product.name}
                </h2>
                <p className="text-2xl font-bold text-primary">{product?.currency}{Number(product.price).toFixed(2)}</p>
                <div className="card-actions justify-between">
                    <div className="flex flex-row justify-start items-center gap-2">
                        <Link aria-disabled={analyticsIsActive} to={`/product/${product.id}/analytics/`} className={`btn ${analyticsIsActive ? "btn-disabled" : "btn-primary"} btn-sm btn-outline`}>
                            <BarChart2Icon className="size-5" />
                        </Link>
                        <div className="indicator">
                            <Link to={`/product/${product.id}/comments/`}
                                aria-disabled={chatIsActive}
                                className={`btn btn-sm btn-outline ${chatIsActive ? "btn-disabled" : "btn-primary"}`}>
                                <span className="indicator-item badge badge-accent badge-sm top-0 right-0">{randNum[0]}</span>
                                <MessageCircle className="size-5" />
                            </Link>
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center justify-end">
                        <Link to={`/product/${product.id}`} className="btn btn-info btn-sm btn-outline">
                            <EditIcon className="size-5" />
                        </Link>
                        <button
                            disabled={deletableAccess}
                            onClick={() => deleteProduct(product.id, gapi, product.mediaFolderId, product.productId, product?.facebookPostId, product?.instagramPostId)}
                            className="btn btn-error btn-sm btn-outline">
                            <Trash2Icon className="size-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;