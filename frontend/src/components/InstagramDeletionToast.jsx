// components/InstagramDeletionToast.jsx
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

const InstagramDeletionToast = ({ permalink, toastId }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(permalink);
        toast.success('Link copied to clipboard!', { id: toastId });
    };

    const openInstagramPost = () => {
        window.open(permalink, '_blank', 'noopener,noreferrer');
        toast.dismiss(toastId);
    };

    return (
        <div className="flex flex-col p-4 bg-white border border-gray-200 rounded-lg shadow-md max-w-md">
            <div className="flex items-start mb-3">
                <div className="flex-shrink-0 text-blue-500 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                        Instagram Post Requires Manual Deletion
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                        Instagram posts can only be deleted manually at the moment. Click the link below to navigate to the post.
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={openInstagramPost}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Open Post
                </button>
                <button
                    onClick={copyToClipboard}
                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    Copy Link
                </button>
            </div>
        </div>
    );
};

// Function to show the Instagram deletion toast
export const showInstagramDeletionToast = (permalink) => {
    return toast.custom(
        (t) => <InstagramDeletionToast permalink={permalink} toastId={t.id} />,
        {
            duration: Infinity, // Toast won't auto-dismiss
            position: 'bottom-center',
        }
    );
};