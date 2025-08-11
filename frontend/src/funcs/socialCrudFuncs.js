import axios from 'axios';

const endpointVersion = "v23.0"; // Updated to latest version

// Enhanced function to get business assets
async function getBusinessAssets(userToken) {
    try {
        // 1. Get managed pages and business ID
        const { data: pages } = await axios.get(
            `https://graph.facebook.com/${endpointVersion}/me/accounts`,
            { 
                params: { 
                    access_token: userToken,
                    fields: 'id,access_token,business,instagram_business_account' 
                } 
            }
        );
        
        if (!pages.data?.length) throw new Error('No pages found');
        const page = pages.data[0];
        const pageId = page.id;
        const pageAccessToken = page.access_token;
        const businessId = page.business?.id;
        const igBusinessId = page.instagram_business_account?.id;

        if (!businessId) throw new Error('No business account found');
        if (!igBusinessId) throw new Error('No linked Instagram account');

        return { 
            pageId, 
            igBusinessId, 
            pageAccessToken,
            businessId
        };
    } catch (error) {
        console.error('Failed to get business assets:', error.response?.data || error.message);
        throw new Error('Business asset retrieval failed');
    }
}

// Create product catalog (v23.0)
export const createProductCatalog = async (userToken, catalogName = 'My Product Catalog') => {
    try {
        // Get business ID
        const { businessId } = await getBusinessAssets(userToken);
        
        // Create catalog
        const catalogRes = await axios.post(
            `https://graph.facebook.com/${endpointVersion}/${businessId}/owned_product_catalogs`,
            {
                name: catalogName,
                vertical: 'commerce',
                flight_api_features_enabled: true // Required for v23.0
            },
            { params: { access_token: userToken } }
        );
        
        return catalogRes.data.id;
    } catch (error) {
        console.error('Catalog creation failed:', error.response?.data || error.message);
        throw new Error('Failed to create product catalog');
    }
};

// Add product to catalog (v23.0)
export const addProductToCatalog = async (userToken, catalogId, productData) => {
    try {
        // Required fields for v23.0
        const requiredProduct = {
            ...productData,
            commerce_tax_category: 'PHYSICAL_GOODS', // New required field
            inventory: productData.inventory || 1 // Default inventory
        };

        const productRes = await axios.post(
            `https://graph.facebook.com/${endpointVersion}/${catalogId}/products`,
            requiredProduct,
            { 
                params: { 
                    access_token: userToken,
                    app_id: 'YOUR_APP_ID' // Add your Facebook App ID
                } 
            }
        );
        
        return productRes.data.id;
    } catch (error) {
        console.error('Product creation failed:', error.response?.data || error.message);
        throw new Error('Failed to add product to catalog');
    }
};

// Create social media post with product tagging (v23.0)
export const createSocialMediaPost = async (
    userToken,
    caption,
    mediaUrl,
    options = {}
) => {
    const { 
        description = "", 
        link = "", 
        productId = null,
        shouldPost = true 
    } = options;

    const { pageId, igBusinessId, pageAccessToken } = await getBusinessAssets(userToken);

    // Create Facebook post if shouldPost is true
    let facebookPostId = null;
    if (shouldPost) {
        const fbParams = {
            message: `${caption}\n\n${description}`,
            access_token: pageAccessToken,
        };

        // Add product tag if productId provided
        if (productId) {
            fbParams.tags = [{ 
                tag_uid: productId, // Changed parameter in v23.0
                tag_text: 'Product',
                x: 0.5,
                y: 0.5
            }];
        } else {
            fbParams.link = link || mediaUrl;
        }

        try {
            const fbRes = await axios.post(
                `https://graph.facebook.com/${endpointVersion}/${pageId}/feed`,
                fbParams, // Changed parameter position in v23.0
            );
            facebookPostId = fbRes.data.id;
        } catch (error) {
            console.error('Facebook post failed:', error.response?.data || error.message);
        }
    }

    // Create Instagram post if shouldPost is true
    let instagramPostId = null;
    if (shouldPost) {
        try {
            const containerParams = {
                image_url: mediaUrl,
                caption: caption,
                access_token: pageAccessToken,
            };

            // Add product tag if productId provided
            if (productId) {
                containerParams.shopping_metadata = JSON.stringify({
                    product_tags: [{
                        product_id: productId,
                        merchant_id: pageId, // New required field in v23.0
                        x: 0.5,
                        y: 0.5
                    }]
                });
            }

            // Create media container
            const igUpload = await axios.post(
                `https://graph.facebook.com/${endpointVersion}/${igBusinessId}/media`,
                containerParams // Changed parameter position in v23.0
            );
            
            const creationId = igUpload.data.id;

            // Publish container
            const igPublish = await axios.post(
                `https://graph.facebook.com/${endpointVersion}/${igBusinessId}/media_publish`,
                { creation_id: creationId },
                { params: { access_token: pageAccessToken } }
            );
            
            instagramPostId = igPublish.data.id;
        } catch (error) {
            console.error('Instagram post failed:', error.response?.data || error.message);
        }
    }

    return {
        facebookPostId,
        instagramPostId,
        pageAccessToken
    };
};

// Catalog management functions
export const getCatalogProducts = async (userToken, catalogId) => {
    const res = await axios.get(
        `https://graph.facebook.com/${endpointVersion}/${catalogId}/products`,
        { 
            params: { 
                access_token: userToken, 
                fields: 'id,name,product_group{id}',
                limit: 200
            } 
        }
    );
    return res.data.data;
};

export const updateProduct = async (userToken, productId, productData) => {
    const res = await axios.post(
        `https://graph.facebook.com/${endpointVersion}/${productId}`,
        productData,
        { params: { access_token: userToken } }
    );
    return res.data.success;
};

export const deleteProduct = async (userToken, productId) => {
    const res = await axios.delete(
        `https://graph.facebook.com/${endpointVersion}/${productId}`,
        { params: { access_token: userToken } }
    );
    return res.data.success;
};

// Existing functions updated for v23.0
export const readSocialMediaPost = async (accessToken, postId) => {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${endpointVersion}/${postId}`,
            {
                params: {
                    fields: 'id,message,permalink_url,created_time',
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
                        fields: 'id,caption,media_url,permalink,timestamp',
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

export const updateSocialMediaPost = async (
    accessToken,
    postId,
    caption,
    description
) => {
    try {
        const res = await axios.post(
            `https://graph.facebook.com/${endpointVersion}/${postId}`,
            { message: `${caption}\n\n${description}` },
            { params: { access_token: accessToken } }
        );
        return { platform: 'facebook', success: res.data.success };
    } catch {
        throw new Error('Only Facebook posts can be updated');
    }
};

export const deleteSocialMediaPost = async (accessToken, postId) => {
    const res = await axios.delete(
        `https://graph.facebook.com/${endpointVersion}/${postId}`,
        { params: { access_token: accessToken } }
    );
    return { success: res.data.success };
};