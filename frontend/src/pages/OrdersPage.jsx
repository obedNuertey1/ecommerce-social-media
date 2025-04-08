
import { useState, useEffect } from 'react';
import {ArrowLeftIcon, Copy, Trash2, Clock, CheckCircle, PlusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNotifications } from '../hooks/useNotifications';
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../store/useProductStore";
import {useOrderStore} from "../store/useOrderStore";
import {useGoogleAuthContext} from "../contexts/GoogleAuthContext"
// Mock data - replace with actual data from your backend
const initialOrders = [
    {
        orderId: Math.floor(100000 + Math.random() * 900000),
        orderNumber: '#001',
        phone: '+1 (555) 123-4567',
        items: [{ name: 'Product A', quantity: 2 }],
        total: 59.98,
        status: 'new',
    },
    {
        orderId: Math.floor(100000 + Math.random() * 900000),
        orderNumber: '#002',
        phone: '+1 (555) 987-6543',
        items: [{ name: 'Product B', quantity: 1 }, { name: 'Product C', quantity: 3 }],
        total: 129.95,
        status: 'pending',
    },
    {
        orderId: Math.floor(100000 + Math.random() * 900000),
        orderNumber: '#003',
        phone: '+1 (555) 555-5555',
        items: [{ name: 'Product D', quantity: 4 }],
        total: 199.96,
        status: 'completed',
    },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState(initialOrders);
    const { playNotification } = useNotifications();
    const [isMounted, setIsMounted] = useState(false);
    const {resetFormData} = useProductStore();
    const {gapi} = useGoogleAuthContext();
    const {setOrderData, orderData, fetchOrders, addOrder, orders:orders2, setOrders:setOrders2, updateOrder, deleteOrder} = useOrderStore();
    const navigate = useNavigate();

    const handleDelete = (orderId, idx) => {
        // setOrders(orders.filter(order => order.orderId !== orderId));
        deleteOrder(idx, gapi);
        // toast.success('Order deleted successfully');
    };

    const cycleStatus = async (orderId, idx) => {
        setOrders2(orders2.map((order) => {
            if (order.orderId === orderId) {    
                const statusOrder = ['new', 'pending', 'completed'];
                const currentIndex = statusOrder.indexOf(order.status);
                const nextIndex = (currentIndex + 1) % statusOrder.length;
            // updateOrder(gapi, idx);
                return { ...order, status: statusOrder[nextIndex] };
            }
            return order;
        }));
        let res = await updateOrder(gapi, idx);
        if(!res){
            setOrders2(orders2.map((order) => {
                if (order.orderId === orderId) {    
                    const statusOrder = ['new', 'pending', 'completed'];
                    const currentIndex = statusOrder.indexOf(order.status);
                    
                    const nextIndex = currentIndex;
                    return { ...order, status: statusOrder[nextIndex] }
                }
                return order;
            }));
        }
    };

    useEffect(()=>{
        fetchOrders(gapi);
    },[]);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    const simulateNewOrder = () => {
        if (!isMounted) return;

        // Generate mock order data
        const newOrder = {
            orderId: Math.floor(100000 + Math.random() * 900000),
            orderNumber: `#${String(orders.length + 1).padStart(3, '0')}`,
            phone: `+1 (${Math.floor(100 + Math.random() * 900)}) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
            items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
                name: `Product ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
                quantity: Math.floor(Math.random() * 5) + 1
            })),
            total: Math.random() * 200 + 50,
            status: 'new'
        };


        setOrderData({orderId: newOrder.orderId, phone: JSON.stringify([newOrder.phone]), items: JSON.stringify(newOrder.items), total: newOrder.total, status: newOrder.status })

        // Play sound and show notification
        // playNotification();
        // toast.custom((t) => (
        //     <>
        //     <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
        //     bg-base-100 border border-base-300 rounded-box p-4 shadow-lg`}>
        //         <div className="flex items-center gap-3">
        //             <div className="flex-none">
        //                 <div className="avatar placeholder">
        //                     <div className="bg-neutral text-neutral-content rounded-full w-8">
        //                         <span className="text-xs">🛒</span>
        //                     </div>
        //                 </div>
        //             </div>
        //             <div className="flex-1">
        //                 <h3 className="font-semibold">New Order!</h3>
        //                 <p className="text-sm">
        //                     {newOrder.phone} ordered{' '}
        //                     {newOrder.items.map((item, idx) => (
        //                         <span key={idx}>
        //                             {truncateText(`${item.name} (x${item.quantity})`, 30)}
        //                             {idx < newOrder.items.length - 1 ? ', ' : ''}
        //                         </span>
        //                     ))}
        //                 </p>
        //             </div>
        //         </div>
        //     </div>
        //     </>
        // ), { duration: 5000 });

        addOrder(gapi);
        // Add to orders list
        // setOrders(prev => [newOrder, ...prev]);
    };

    const truncateText = (text, maxLength) => {
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    const copyToClipboard = (order) => {
        
        const text = `Order ${order.orderNumber}
            OrderId: ${order.orderId}
            Phone: ${order.phone}
            Items: ${order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
            Total: $${Number(order.total).toFixed(2)}
            Status: ${order.status}`;
            console.log("copyToClipboard=", text);
        navigator.clipboard.writeText(text);
        toast.success('Order details copied to clipboard');
    };

    const getStatusProperties = (status) => {
        switch (status) {
            case 'new':
                return { color: 'btn-info', icon: PlusCircle, label: 'New' };
            case 'pending':
                return { color: 'btn-warning', icon: Clock, label: 'Pending' };
            case 'completed':
                return { color: 'btn-success', icon: CheckCircle, label: 'Completed' };
            default:
                return { color: 'btn-info', icon: PlusCircle, label: 'New' };
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-base-300/80 min-h-screen">
            <button
                onClick={() => {
                    resetFormData();
                    navigate("/");
                }}
                className="btn btn-ghost mb-8">
                <ArrowLeftIcon className="size-5 mr-2"
                />
                Back to Products
            </button>
            <h1 className="text-3xl font-bold mb-8 text-primary">Order Management</h1>
            <button
                onClick={simulateNewOrder}
                className="btn btn-primary"
            >
                Simulate New Order
            </button>
            <div className="overflow-x-auto rounded-lg border border-base-200 bg-base-300/80">
                <table className="table w-full">
                    <thead className="bg-base-200">
                        <tr>
                            <th>Order Number</th>
                            <th>Phone</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Order ID</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders2.map(order => {
                            const { color, icon: Icon, label } = getStatusProperties(order.status);
                            return (
                                <tr key={order.orderId}>
                                    <td className="font-semibold">{order.orderNumber}</td>
                                    <td>{order.phone}</td>
                                    <td>
                                        {order.items.map((item, index) => (
                                            <div key={index} className="badge badge-outline badge-sm mr-2 flex-nowrap text-nowrap">
                                                {item.name} (x{item.quantity})
                                            </div>
                                        ))}
                                    </td>
                                    <td>${Number(order.total).toFixed(2)}</td>
                                    <td>{order.orderId}</td>
                                    <td>
                                        <button
                                            onClick={() => cycleStatus(order.orderId, order.id)}
                                            className={`btn btn-xs gap-2 flex-nowrap text-nowrap ${color}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {label}
                                        </button>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => copyToClipboard(order)}
                                                className="btn btn-ghost btn-xs"
                                                title="Copy order details"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(order.orderId, order.id)}
                                                className="btn btn-ghost btn-xs text-error"
                                                title="Delete order"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {orders.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-lg text-base-content/50">No orders found</div>
                </div>
            )}
        </div>
    );
}