import axios from 'axios';

const endpointVersion = "v23.0";
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID_2;

// Unified function to get business assets (updated for long-lived tokens)
export async function getBusinessAssets(token) {
    try {
        // Always try to get pages first (works for user tokens)
        const { data: pagesData } = await axios.get(
            `https://graph.facebook.com/${endpointVersion}/me/accounts`,
            {
                params: {
                    access_token: token,
                    fields: 'id,access_token,instagram_business_account,business'
                }
            }
        );

        if (pagesData.data?.length) {
            const page = pagesData.data[0];
            console.log({ page });
            return {
                pageId: page.id,
                igBusinessId: page.instagram_business_account?.id,
                businessId: page.business?.id,
                pageAccessToken: page.access_token  // Use page token from response
            };
        }

        // If no pages found, try direct token as page token
        const pageInfo = await axios.get(
            `https://graph.facebook.com/${endpointVersion}/me`,
            {
                params: {
                    access_token: token,
                    fields: 'id,instagram_business_account,business,category'
                }
            }
        );

        // Verify it's a page (has category field)
        if (!pageInfo.data.category) {
            throw new Error('Token is not a valid page token');
        }

        console.log({ pageInfo });

        return {
            pageId: pageInfo.data.id,
            igBusinessId: pageInfo.data.instagram_business_account?.id,
            businessId: pageInfo.data.business?.id,
            pageAccessToken: token  // Use original token as page token
        };
    } catch (error) {
        console.error('Asset retrieval failed:', error.response?.data || error.message);
        throw new Error('Failed to get business assets');
    }
}

// Verify Instagram link
async function verifyInstagramLink(pageId, pageAccessToken) {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${endpointVersion}/${pageId}`,
            {
                params: {
                    fields: 'instagram_business_account',
                    access_token: pageAccessToken
                }
            }
        );

        if (!response.data.instagram_business_account) {
            throw new Error('Instagram not linked to Facebook Page');
        }

        return response.data.instagram_business_account.id;
    } catch (error) {
        console.error('Link verification failed:', error.response?.data || error.message);
        return null;
    }
}

// CATALOG MANAGEMENT =========================================================

// Get all catalogs for a business
export const getProductCatalogs = async (userToken) => {
    try {
        const { businessId } = await getBusinessAssets(userToken);
        const response = await axios.get(
            `https://graph.facebook.com/${endpointVersion}/${businessId}/owned_product_catalogs`,
            { params: { access_token: userToken, fields: 'id,name,product_count' } }
        );
        return response.data.data;
    } catch (error) {
        console.error('Catalog fetch failed:', error.response?.data || error.message);
        throw new Error('Failed to get catalogs');
    }
};

// Create product catalog
export const createProductCatalog = async (userToken, catalogName = 'My Product Catalog') => {
    try {
        const { businessId } = await getBusinessAssets(userToken);
        if (!businessId) throw new Error('No business account found');

        const catalogRes = await axios.post(
            `https://graph.facebook.com/${endpointVersion}/${businessId}/owned_product_catalogs`,
            {
                name: catalogName,
                vertical: 'commerce',
                flight_api_features_enabled: true
            },
            { params: { access_token: userToken } }
        );

        return catalogRes.data.id;
    } catch (error) {
        console.error('Catalog creation failed:', error.response?.data || error.message);
        throw new Error('Failed to create product catalog');
    }
};

// Update catalog name
export const updateProductCatalog = async (userToken, catalogId, newName) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${endpointVersion}/${catalogId}`,
            { name: newName },
            { params: { access_token: userToken } }
        );
        return response.data.success;
    } catch (error) {
        console.error('Catalog update failed:', error.response?.data || error.message);
        throw new Error('Failed to update catalog');
    }
};

// Delete catalog
export const deleteProductCatalog = async (userToken, catalogId) => {
    try {
        const response = await axios.delete(
            `https://graph.facebook.com/${endpointVersion}/${catalogId}`,
            { params: { access_token: userToken } }
        );
        return response.data.success;
    } catch (error) {
        console.error('Catalog deletion failed:', error.response?.data || error.message);
        throw new Error('Failed to delete catalog');
    }
};

// PRODUCT MANAGEMENT =========================================================

// Get all products in a catalog
export const getCatalogProducts = async (userToken, catalogId) => {
    const res = await axios.get(
        `https://graph.facebook.com/${endpointVersion}/${catalogId}/products`,
        {
            params: {
                access_token: userToken,
                fields: 'id,name,price,image_url,availability',
                limit: 200
            }
        }
    );
    return res.data.data;
};

// Get single product details
export const getProductDetails = async (userToken, productId) => {
    const res = await axios.get(
        `https://graph.facebook.com/${endpointVersion}/${productId}`,
        {
            params: {
                access_token: userToken,
                fields: 'id,name,description,price,image_url,url,availability,brand,category,condition'
            }
        }
    );
    return res.data;
};

// Add product to catalog
export const addProductToCatalog = async (userToken, catalogId, productData) => {
    try {
        const requiredProduct = {
            ...productData,
            // commerce_tax_category: 'PHYSICAL_GOODS',
            inventory: productData.inventory || 1
        };

        const productRes = await axios.post(
            `https://graph.facebook.com/${endpointVersion}/${catalogId}/products`,
            requiredProduct,
            {
                params: {
                    access_token: userToken,
                    app_id: FACEBOOK_APP_ID
                }
            }
        );

        return productRes.data.id;
    } catch (error) {
        console.error('Product creation failed:', error.response?.data || error.message);
        throw new Error('Failed to add product to catalog');
    }
};

// Update product
export const updateProduct = async (userToken, productId, productData) => {
    const res = await axios.post(
        `https://graph.facebook.com/${endpointVersion}/${productId}`,
        productData,
        { params: { access_token: userToken } }
    );
    return res.data.success;
};

// Delete product
export const deleteProduct = async (userToken, productId) => {
    const res = await axios.delete(
        `https://graph.facebook.com/${endpointVersion}/${productId}`,
        { params: { access_token: userToken } }
    );
    return res.data.success;
};

// POST MANAGEMENT ============================================================

// Create social media post
export const createSocialMediaPost = async (
    token,
    caption,
    mediaUrls, // Changed to array of URLs
    options = {}
) => {
    const {
        description = "",
        link = "",
        productId = null,
        retailerId = "", // Add retailerId parameter,
        price = "",
        currency = "",
        shouldPost = true
    } = options;

    // Get page assets
    const { pageId, pageAccessToken } = await getBusinessAssets(token);

    // Verify Instagram link
    const igBusinessId = await verifyInstagramLink(pageId, pageAccessToken);
    if (!igBusinessId) throw new Error('No linked Instagram account');

    // Create Facebook carousel post
    let facebookPostId = null;
    if (shouldPost) {
        try {
            // Upload all media items
            const mediaIds = [];
            for (const url of mediaUrls) {
                const mediaResponse = await axios.post(
                    `https://graph.facebook.com/${endpointVersion}/${pageId}/photos`,
                    {
                        url: url,
                        published: false,
                        access_token: pageAccessToken
                    }
                );
                mediaIds.push(mediaResponse.data.id);
            }

            // Create carousel post
            const fbParams = {
                message: `${caption}\n\n${description}\n\n
                ╔══════════════════════════════════════════════════x╗
                ║ 🔥 LIMITED EDITION 🔥                                                                                                                               ║                                                                                                                
                ║ 🛒 BUY NOW for Just for ${currency}${Number(price).toFixed(2)}
                ║                                                                        
                ║     Order from the link below                                                                                             
                ║     ${link}                                                                      
                ╚══════════════════════════════════════════════════x╝
                `,
                access_token: pageAccessToken,
                attached_media: JSON.stringify(
                    mediaIds.map(id => ({ media_fbid: id }))
                ),
                ...(productId && {
                    product_set: JSON.stringify({
                        id: productId,
                        retailer_id: retailerId
                    })
                })
            };

            const fbRes = await axios.post(
                `https://graph.facebook.com/${endpointVersion}/${pageId}/feed`,
                fbParams
            );
            facebookPostId = fbRes.data.id;
        } catch (error) {
            console.error('Facebook post failed:', error.response?.data || error.message);
            throw error;
        }
    }

    // Create Instagram carousel post
    let instagramPostId = null;
    let instagramPermalink = null;
    if (shouldPost) {
        try {
            // Create children containers
            const children = [];
            for (const url of mediaUrls) {
                const childRes = await axios.post(
                    `https://graph.facebook.com/${endpointVersion}/${igBusinessId}/media`,
                    {
                        image_url: url,
                        is_carousel_item: true,
                        access_token: pageAccessToken
                    }
                );
                children.push(childRes.data.id);
            }

            // Create carousel container
            const containerParams = {
                media_type: "CAROUSEL",
                children: children.join(','),
                caption: `${caption}\n\n${description}\n\n
                ╔═══════════════════════════════════════════════════x╗
                ║ 🔥 **LIMITED EDITION** 🔥                                                                                                                                                                        
                ║ 🛒 BUY NOW for Just for ${currency}${Number(price).toFixed(2)}
                ║     Order from the link below
                ║                                                                                                 
                ║     ${link}                                                                      
                ╚═══════════════════════════════════════════════════x╝
                `,
                access_token: pageAccessToken,
            };

            // Add product tagging to first image
            if (productId) {
                containerParams.shopping_metadata = JSON.stringify([{
                    image_index: 0,
                    product_tags: [{
                        product_id: productId,
                        merchant_id: pageId,
                        x: 0.5,
                        y: 0.5
                    }]
                }]);
            }

            const containerRes = await axios.post(
                `https://graph.facebook.com/${endpointVersion}/${igBusinessId}/media`,
                containerParams
            );

            const containerId = containerRes.data.id;

            // Publish the carousel
            const publishRes = await axios.post(
                `https://graph.facebook.com/${endpointVersion}/${igBusinessId}/media_publish`,
                {
                    creation_id: containerId,
                    access_token: pageAccessToken
                }
            );

            instagramPostId = publishRes.data.id;
            // Get the permalink for the Instagram post
            const mediaInfo = await axios.get(
                `https://graph.facebook.com/${endpointVersion}/${instagramPostId}`,
                {
                    params: {
                        fields: 'permalink',
                        access_token: pageAccessToken
                    }
                }
            );

            instagramPermalink = mediaInfo.data.permalink;
        } catch (error) {
            console.error('Instagram post failed:', error.response?.data || error.message);
            throw error;
        }
    }

    return {
        facebookPostId,
        instagramPostId,
        instagramPermalink,
        pageAccessToken
    };
};

// Create Instagram post only
export const createInstagramPost = async (
    token,
    caption,
    mediaUrls,
    options = {}
) => {
    const {
        description = "",
        link = "",
        productId = null,
        retailerId = "",
        price = "",
        currency = "",
    } = options;

    // Get page assets
    const { pageId, pageAccessToken } = await getBusinessAssets(token);

    // Verify Instagram link
    const igBusinessId = await verifyInstagramLink(pageId, pageAccessToken);
    if (!igBusinessId) throw new Error('No linked Instagram account');

    let instagramPostId = null;
    let instagramPermalink = null;

    console.log({mediaUrls});

    try {
        // Create children containers
        const children = [];
        for (const url of mediaUrls) {
            const childRes = await axios.post(
                `https://graph.facebook.com/${endpointVersion}/${igBusinessId}/media`,
                {
                    image_url: url,
                    is_carousel_item: true,
                    access_token: pageAccessToken
                }
            );
            children.push(childRes.data.id);
        }

        // Create carousel container
        const containerParams = {
            media_type: "CAROUSEL",
            children: children.join(','),
            caption: `${caption}\n\n${description}\n\n
      ╔═══════════════════════════════════════════════════x╗
      ║ 🔥 **LIMITED EDITION** 🔥                                                                                                                                                                        
      ║ 🛒 BUY NOW for Just for ${currency}${Number(price).toFixed(2)}
      ║     Order from the link below
      ║                                                                                                 
      ║     ${link}                                                                      
      ╚═══════════════════════════════════════════════════x╝
      `,
            access_token: pageAccessToken,
        };

        // Add product tagging to first image
        if (productId) {
            containerParams.shopping_metadata = JSON.stringify([{
                image_index: 0,
                product_tags: [{
                    product_id: productId,
                    merchant_id: pageId,
                    x: 0.5,
                    y: 0.5
                }]
            }]);
        }

        const containerRes = await axios.post(
            `https://graph.facebook.com/${endpointVersion}/${igBusinessId}/media`,
            containerParams
        );

        const containerId = containerRes.data.id;

        // Publish the carousel
        const publishRes = await axios.post(
            `https://graph.facebook.com/${endpointVersion}/${igBusinessId}/media_publish`,
            {
                creation_id: containerId,
                access_token: pageAccessToken
            }
        );

        instagramPostId = publishRes.data.id;

        // Get the permalink for the Instagram post
        const mediaInfo = await axios.get(
            `https://graph.facebook.com/${endpointVersion}/${instagramPostId}`,
            {
                params: {
                    fields: 'permalink',
                    access_token: pageAccessToken
                }
            }
        );
        instagramPermalink = mediaInfo.data.permalink;

    } catch (error) {
        console.error('Instagram post failed:', error.response?.data || error.message);
        throw error;
    }

    return { instagramPostId, instagramPermalink };
};

// Get post details
export const getPostDetails = async (accessToken, postId) => {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${endpointVersion}/${postId}`,
            {
                params: {
                    fields: 'id,message,permalink_url,created_time,attachments',
                    access_token: accessToken,
                },
            }
        );
        return { platform: 'facebook', data: response.data };
    } catch (fbErr) {
        try {
            const response = await axios.get(
                `https://graph.facebook.com/${endpointVersion}/${postId}`,
                {
                    params: {
                        fields: 'id,caption,media_url,permalink,timestamp,media_type',
                        access_token: accessToken,
                    },
                }
            );
            return { platform: 'instagram', data: response.data };
        } catch (igErr) {
            throw new Error('Post not found on either platform');
        }
    }
};


// Update post (Facebook only)
export const updateSocialMediaPost = async (
    accessToken,
    postId,
    caption,
    description,
    options = {}
) => {
    const { currency = "", price = "", link } = options;

    try {
        const res = await axios.post(
            `https://graph.facebook.com/${endpointVersion}/${postId}`,
            {
                message: `${caption}\n\n${description}\n\n
                ╔══════════════════════════════════════════════════x╗
                ║ 🔥 LIMITED EDITION 🔥                                                                                                                               ║                                                                                                                
                ║ 🛒 BUY NOW for Just for ${currency}${Number(price).toFixed(2)}
                ║                                                                        
                ║     Order from the link below                                                                                             
                ║     ${link}                                                                      
                ╚══════════════════════════════════════════════════x╝` },
            { params: { access_token: accessToken } }
        );
        return { platform: 'facebook', success: res.data.success };
    } catch (error) {
        if (error.response?.data?.error?.code === 100) {
            // Try updating as Instagram media
            try {
                const res = await axios.post(
                    `https://graph.facebook.com/${endpointVersion}/${postId}`,
                    { caption: `${caption}\n\n${description}` },
                    { params: { access_token: accessToken } }
                );
                return { platform: 'instagram', success: res.data.success };
            } catch (igErr) {
                throw new Error('Failed to update Instagram post');
            }
        }
        throw new Error('Failed to update post');
    }
};

// Delete post
export const deleteSocialMediaPost = async (accessToken, postId) => {

    try {
        console.log(`Attempting to delete post ${postId}`);
        const res = await axios.delete(
            `https://graph.facebook.com/${endpointVersion}/${postId}`,
            {
                params: { access_token: accessToken },
                timeout: 10000 // Set a timeout to avoid hanging
            }
        );
        console.log(`Successfully deleted post ${postId}:`, res.data);
        return { success: res.data.success };
    } catch (error) {
        console.error(`Error deleting post ${postId}:`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
};

// Get all Facebook page posts
export const getFacebookPagePosts = async (pageAccessToken, pageId, limit = 25) => {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${endpointVersion}/${pageId}/feed`,
            {
                params: {
                    fields: 'id,message,created_time,permalink_url,attachments',
                    access_token: pageAccessToken,
                    limit: limit
                }
            }
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to get Facebook posts:', error.response?.data || error.message);
        throw new Error('Failed to fetch page posts');
    }
};

// Get all Instagram media
export const getInstagramMedia = async (pageAccessToken, igBusinessId, limit = 25) => {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${endpointVersion}/${igBusinessId}/media`,
            {
                params: {
                    fields: 'id,caption,media_url,permalink,timestamp,media_type',
                    access_token: pageAccessToken,
                    limit: limit
                }
            }
        );
        return response.data.data;
    } catch (error) {
        console.error('Failed to get Instagram media:', error.response?.data || error.message);
        throw new Error('Failed to fetch Instagram media');
    }
};

// MEDIA UPLOADS ==============================================================

// Upload image to Facebook
export const uploadImageToFacebook = async (pageAccessToken, pageId, imageUrl) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${endpointVersion}/${pageId}/photos`,
            {
                url: imageUrl,
                published: false,
                access_token: pageAccessToken
            }
        );
        return response.data.id; // Returns the photo ID
    } catch (error) {
        console.error('Facebook image upload failed:', error.response?.data || error.message);
        throw new Error('Failed to upload image to Facebook');
    }
};

// Create Instagram media container (for later publishing)
export const createInstagramMediaContainer = async (pageAccessToken, igBusinessId, imageUrl, caption = '') => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${endpointVersion}/${igBusinessId}/media`,
            {
                image_url: imageUrl,
                caption: caption,
                access_token: pageAccessToken
            }
        );
        return response.data.id; // Returns the container ID
    } catch (error) {
        console.error('Instagram media container creation failed:', error.response?.data || error.message);
        throw new Error('Failed to create Instagram media container');
    }
};

// PUBLISHING HELPERS =========================================================

// Publish scheduled post
export const publishScheduledPost = async (pageAccessToken, postId) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${endpointVersion}/${postId}`,
            {
                is_published: true
            },
            { params: { access_token: pageAccessToken } }
        );
        return response.data.success;
    } catch (error) {
        console.error('Post publishing failed:', error.response?.data || error.message);
        throw new Error('Failed to publish scheduled post');
    }
};

// Schedule post
export const schedulePost = async (pageAccessToken, pageId, message, scheduledTime) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${endpointVersion}/${pageId}/feed`,
            {
                message: message,
                published: false,
                scheduled_publish_time: Math.floor(scheduledTime.getTime() / 1000),
                access_token: pageAccessToken
            }
        );
        return response.data.id; // Returns the scheduled post ID
    } catch (error) {
        console.error('Post scheduling failed:', error.response?.data || error.message);
        throw new Error('Failed to schedule post');
    }
};

// ANALYTICS ==================================================================

// Get post insights
export const getPostInsights = async (accessToken, postId, metrics = ['engagement', 'impressions']) => {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${endpointVersion}/${postId}/insights`,
            {
                params: {
                    metric: metrics.join(','),
                    access_token: accessToken
                }
            }
        );
        return response.data.data;
    } catch (error) {
        console.error('Insights fetch failed:', error.response?.data || error.message);
        throw new Error('Failed to get post insights');
    }
};

// Get catalog analytics
export const getCatalogAnalytics = async (userToken, catalogId) => {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${endpointVersion}/${catalogId}/stats`,
            { params: { access_token: userToken } }
        );
        return response.data.data;
    } catch (error) {
        console.error('Catalog analytics failed:', error.response?.data || error.message);
        throw new Error('Failed to get catalog analytics');
    }
};