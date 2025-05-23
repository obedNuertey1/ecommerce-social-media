import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { MessageCircle, Reply, Trash2, ArrowLeftIcon } from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { useNavigate, useParams } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { createPortal } from 'react-dom';
import { useGoogleAuthContext } from '../contexts/GoogleAuthContext';
import { privilegeAccess, createLogs } from '../funcs/essentialFuncs';

const CommentItem = memo(({
    comment,
    platform,
    replyingTo,
    replyText,
    onReply,
    onDeleteComment,
    onDeleteReply,
    onSetReplyingTo,
    onSetReplyText
}) => {
    const { theme } = useSettingsStore().settings.visualCustomization.themeSelection;

    const {creatableAccess, deletableAccess} = privilegeAccess();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
      }, [theme]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
    const buttonRef = useRef(null);
    useEffect(() => {
        
    }, [theme])

    const handleClickOutside = useCallback((e) => {
        if (emojiPickerRef.current &&
            !emojiPickerRef.current.contains(e.target) &&
            !buttonRef.current.contains(e.target)
        ) {
            setShowEmojiPicker(false);
        }
    }, []);

    useEffect(() => {
        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker, handleClickOutside]);

    const getPickerPosition = () => {
        if (!buttonRef.current) return {};
        const rect = buttonRef.current.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY - 400, // Adjust based on your needs
            left: rect.left + window.scrollX - 200 // Adjust based on your needs
        };
    };
    return (
        <div className="card bg-base-100 shadow-sm mb-4">
            <div className="card-body p-4">
                <div className="flex items-start gap-3">
                    <img
                        src={comment.profilePic}
                        alt={comment.user}
                        className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                        <h4 className="font-bold text-sm">{comment.user}</h4>
                        <p className="text-sm mt-1">{comment.text}</p>

                        {comment.replies?.map(reply => (
                            <div key={reply.id} className="mt-3 ml-4 pl-4 border-l-2 border-base-200">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium">Admin:</span>
                                    <p>{reply.text}</p>
                                    {platform !== 'threads' && (
                                        <button
                                            onClick={() => onDeleteReply(platform, comment.id, reply.id)}
                                            className="btn btn-xs btn-ghost text-error"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {platform !== 'threads' && (
                            <div className="mt-3 flex gap-2">
                                <button
                                    disabled={creatableAccess}
                                    onClick={() => onSetReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                    className="btn btn-xs btn-ghost"
                                >
                                    <Reply size={14} className="mr-1" /> Reply
                                </button>
                                <button
                                    disabled={deletableAccess}
                                    onClick={() => onDeleteComment(platform, comment.id)}
                                    className="btn btn-xs btn-ghost text-error"
                                >
                                    <Trash2 size={14} className="mr-1" /> Delete
                                </button>
                            </div>
                        )}

                        {replyingTo === comment.id && (
                            <div className="mt-3 flex flex-col gap-2 flex-wrap">
                                {/* Modification starts */}
                                <div className="relative">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => onSetReplyText(comment.id, e.target.value)}
                                        placeholder="Write a reply..."
                                        className="textarea textarea-bordered w-full pr-10"
                                    />
                                    <button
                                        ref={buttonRef}
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="btn btn-ghost btn-sm absolute right-2 bottom-2"
                                    >
                                        😀
                                    </button>
                                    {showEmojiPicker && createPortal(
                                        <div
                                            ref={emojiPickerRef}
                                            className="fixed z-50 transition-all duration-200"
                                            style={getPickerPosition()}
                                        >
                                            <EmojiPicker
                                                width="100%"
                                                height={400}
                                                previewConfig={{ showPreview: false }}
                                                onEmojiClick={(emojiData) => {
                                                    onSetReplyText(comment.id, replyText + emojiData.emoji);
                                                    // setShowEmojiPicker(false);
                                                }}
                                                theme={theme}
                                                skinTonesDisabled
                                                searchDisabled={window.innerWidth < 768}
                                                lazyLoadEmojis
                                            />
                                        </div>,
                                        document.body
                                    )}
                                </div>
                                {/* modification ends */}
                                <div className='flex flex-row gap-2 items-center justify-center'>
                                    <button
                                        onClick={() => onReply(platform, comment.id)}
                                        className="btn btn-primary btn-sm min-w-[calc(50%-0.25rem)]"
                                    >
                                        Post
                                    </button>
                                    <button
                                        onClick={() => onSetReplyingTo(null)}
                                        className='btn btn-error btn-sm min-w-[calc(50%-0.25rem)]'
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});


export default function ProductComments() {
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyTexts, setReplyTexts] = useState({});
    const emojiPickerRef = useRef(null);
    const newCommentButtonRef = useRef(null);
    const [showNewCommentEmojiPicker, setShowNewCommentEmojiPicker] = useState(false);
    const { fetchProduct, product, loading, error, resetFormData, formData } = useProductStore();
    const {gapi} = useGoogleAuthContext();
    const {creatableAccess, deletableAccess} = privilegeAccess();
    const { id } = useParams();
    const pageLoadedRef = useRef(false);

    useEffect(() => {
        fetchProduct(id, gapi);
    }, [fetchProduct, id]);

    useEffect(() => {
        window.scrollTo(0, 0)
        const pageLoaded = ()=>{
            if(localStorage.getItem("passkey")){
                if(pageLoadedRef.current) return;
                const passkeyName = localStorage.getItem("passkeyName");
                createLogs("Accessed", `${passkeyName} entered the ${formData.name} Product with id ${id} Comments Page`)
                pageLoadedRef.current = true;
            }
        }

        pageLoaded();
        return ()=>{}
    }, [])

    const handleNewCommentClickOutside = useCallback((e) => {
        if (emojiPickerRef.current && 
            !emojiPickerRef.current.contains(e.target) && 
            !newCommentButtonRef.current.contains(e.target)
        ) {
            setShowNewCommentEmojiPicker(false);
        }
    }, []);

    useEffect(() => {
        if (showNewCommentEmojiPicker) {
            document.addEventListener('mousedown', handleNewCommentClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleNewCommentClickOutside);
        };
    }, [showNewCommentEmojiPicker, handleNewCommentClickOutside]);

    const getNewCommentPickerPosition = () => {
        if (!newCommentButtonRef.current) return {};
        const rect = newCommentButtonRef.current.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY - 400, // Adjust based on your needs
            left: rect.left + window.scrollX - 200 // Adjust based on your needs
        };
    };

    const { theme } = useSettingsStore().settings.visualCustomization.themeSelection;
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const navigate = useNavigate();
    const productName = product?.name;


    const [comments, setComments] = useState({
        facebook: [
            {
                id: '1',
                user: 'John Doe',
                text: 'Great product! Does it come with a warranty?',
                profilePic: 'https://img.daisyui.com/images/profile/demo/1@94.webp',
                replies: []
            },
            {
                id: '2',
                user: 'Jane Doe',
                text: 'I am very sure it is quality',
                profilePic: 'https://img.daisyui.com/images/profile/demo/3@94.webp',
                replies: []
            },
            {
                id: '3',
                user: 'Mike Johnson',
                text: 'Love the design! ❤️',
                profilePic: 'https://img.daisyui.com/images/profile/demo/4@94.webp',
                replies: []
            }
        ],
        instagram: [
            {
                id: '1',
                user: 'John Doe',
                text: 'Great product! Does it come with a warranty?',
                profilePic: 'https://img.daisyui.com/images/profile/demo/1@94.webp',
                replies: []
            },
            {
                id: '2',
                user: 'Jane Doe',
                text: 'I am very sure it is quality',
                profilePic: 'https://img.daisyui.com/images/profile/demo/3@94.webp',
                replies: []
            },
            {
                id: '3',
                user: 'Mike Johnson',
                text: 'Love the design! ❤️',
                profilePic: 'https://img.daisyui.com/images/profile/demo/4@94.webp',
                replies: []
            }
        ],
        threads: [
            {
                id: '3',
                user: 'Mike Johnson',
                text: 'Any color variations available?',
                profilePic: 'https://img.daisyui.com/images/profile/demo/3@94.webp'
            }
        ]
    });
    const handleReply = useCallback((platform, commentId) => {
        const replyText = replyTexts[commentId]?.trim();
        if (replyText) {
            setComments(prev => ({
                ...prev,
                [platform]: prev[platform].map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            replies: [...comment.replies, {
                                id: Date.now(),
                                text: replyText,
                                admin: true
                            }]
                        };
                    }
                    return comment;
                })
            }));
            setReplyTexts(prev => ({ ...prev, [commentId]: '' }));
            setReplyingTo(null);
            toast.success('Reply posted successfully');
        }
    }, [replyTexts]);

    const deleteComment = useCallback((platform, commentId) => {
        setComments(prev => ({
            ...prev,
            [platform]: prev[platform].filter(comment => comment.id !== commentId)
        }));
        toast.success('Comment deleted successfully');
    }, []);

    const deleteReply = useCallback((platform, commentId, replyId) => {
        setComments(prev => ({
            ...prev,
            [platform]: prev[platform].map(comment => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        replies: comment.replies.filter(reply => reply.id !== replyId)
                    };
                }
                return comment;
            })
        }));
        toast.success('Reply deleted successfully');
    }, []);

    const handleSetReplyText = useCallback((commentId, text) => {
        setReplyTexts(prev => ({ ...prev, [commentId]: text }));
    }, []);

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="alert alert-error">{error}</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <button
                onClick={() => {
                    resetFormData();
                    navigate("/");
                }}
                className="btn btn-ghost mb-8"
            >
                <ArrowLeftIcon className="size-5 mr-2" />
                Back to Products
            </button>
            <h1 className="text-2xl font-bold mb-8">{productName} Comments</h1>
            <div role="tablist" className="tabs tabs-lifted">
                {/* Facebook Tab */}
                <input type="radio" defaultChecked name="my_tabs_2" role="tab" className="tab" aria-label="Facebook" />
                <div role="tabpanel" className="tab-content bg-base-100 max-h-[calc(100vh-20rem)] overflow-y-scroll border-base-300 rounded-box p-2 md:p-6">
                    {comments.facebook.map((comment, id, arr) => (
                        <>
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                platform="facebook"
                                replyingTo={replyingTo}
                                replyText={replyTexts[comment.id] || ''}
                                onReply={handleReply}
                                onDeleteComment={deleteComment}
                                onDeleteReply={deleteReply}
                                onSetReplyingTo={setReplyingTo}
                                onSetReplyText={handleSetReplyText}
                            />
                            {(id !== arr.length - 1) && <div className='divider' />}
                        </>
                    ))}
                </div>

                {/* Instagram Tab */}
                <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="Instagram" />
                <div role="tabpanel" className="tab-content bg-base-100 border-base-300 max-h-[calc(100vh-20rem)] overflow-y-scroll rounded-box p-2 md:p-6">
                    {comments.instagram.map((comment, id, arr) => (
                        <>
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                platform="instagram"
                                replyingTo={replyingTo}
                                replyText={replyTexts[comment.id] || ''}
                                onReply={handleReply}
                                onDeleteComment={deleteComment}
                                onDeleteReply={deleteReply}
                                onSetReplyingTo={setReplyingTo}
                                onSetReplyText={handleSetReplyText}
                            />
                            {(id !== arr.length - 1) && <div className='divider' />}
                        </>
                    ))}
                </div>

                {/* Threads Tab */}
                <input type="radio" name="my_tabs_2" role="tab" className="tab" aria-label="Threads" />
                <div role="tabpanel" className="tab-content bg-base-100 border-base-300 max-h-[calc(100vh-20rem)] overflow-y-scroll rounded-box p-2 md:p-6">
                    {comments.threads.map((comment, id, arr) => (
                        <>
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                platform="threads"
                                replyingTo={replyingTo}
                                replyText={replyTexts[comment.id] || ''}
                                onReply={handleReply}
                                onDeleteComment={deleteComment}
                                onDeleteReply={deleteReply}
                                onSetReplyingTo={setReplyingTo}
                                onSetReplyText={handleSetReplyText}
                            />
                            {(id !== arr.length - 1) && <div className='divider' />}
                        </>
                    ))}
                </div>

            </div>
            <div className="mt-8 flex gap-2 flex-wrap">
                {/* Modification starts */}
                <div className="bg-base-300/50 min-w-full relative">
                <textarea
                        disabled={creatableAccess}
                        className="textarea textarea-ghost textarea-bordered min-w-full pr-10"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a new comment..."
                    />
                    <button
                        ref={newCommentButtonRef}
                        type="button"
                        onClick={() => setShowNewCommentEmojiPicker(!showNewCommentEmojiPicker)}
                        className="btn btn-ghost btn-sm absolute right-2 bottom-2"
                    >
                        😀
                    </button>
                    {showNewCommentEmojiPicker && createPortal(
                        <div 
                            ref={emojiPickerRef}
                            className="fixed z-50 transition-all duration-200"
                            style={getNewCommentPickerPosition()}
                        >
                            <EmojiPicker
                                width="100%"
                                height={400}
                                previewConfig={{ showPreview: false }}
                                onEmojiClick={(emojiData) => {
                                    setNewComment(prev => prev + emojiData.emoji);
                                    // setShowNewCommentEmojiPicker(false);
                                }}
                                theme={theme}
                                skinTonesDisabled
                                searchDisabled={window.innerWidth < 768}
                                lazyLoadEmojis
                            />
                        </div>,
                        document.body
                    )}
                </div>
                {/* Modification ends */}
                <button
                    className="btn btn-primary min-w-full"
                    disabled={creatableAccess}
                    onClick={() => {
                        // Implement API call to post comment
                        toast.success('Comment posted successfully');
                        setNewComment('');
                    }}
                >
                    <MessageCircle size={18} className="mr-2" />
                    Post Comment
                </button>
            </div>
        </div>
    );
}