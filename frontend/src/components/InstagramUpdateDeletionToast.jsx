// components/InstagramDeletionToast.jsx
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

    const ignore = () => {
        toast.dismiss(toastId);
    };

    return (
        <div className="flex flex-col p-4 bg-base-100 border border-base-300 rounded-box shadow-lg max-w-md">
            <div className="flex items-start mb-3">
                <div className="flex-shrink-0 text-info mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-base-content">
                        New Instagram Post Created
                    </p>
                    <p className="mt-1 text-sm text-base-content opacity-70">
                        Instagram doesn't allow post updates. A new post was created. You may want to delete the old post manually.
                    </p>
                </div>
            </div>
            <div className="flex gap-2 mb-2">
                <button
                    onClick={openInstagramPost}
                    className="btn btn-primary btn-sm flex-1"
                >
                    Open Post
                </button>
                <button
                    onClick={copyToClipboard}
                    className="btn btn-outline btn-sm flex-1"
                >
                    Copy Link
                </button>
            </div>
            <button
                onClick={ignore}
                className="btn btn-ghost btn-sm w-full"
            >
                Ignore
            </button>
        </div>
    );
};

// Function to show the Instagram deletion toast
export const showInstagramUpdateDeletionToast = (permalink) => {
    return toast.custom(
        (t) => <InstagramDeletionToast permalink={permalink} toastId={t.id} />,
        {
            duration: Infinity, // Toast won't auto-dismiss
            position: 'bottom-center',
        }
    );
};