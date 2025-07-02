import axios from 'axios'

// const endpointVersion = "v19.0"
const endpointVersion = "v23.0"

//–– Helper: get your Page ID and Instagram Business ID ––//
async function getPageAndIgIds(userToken) {
    // 1. List pages the user manages
    const { data: pages } = await axios.get(
        `https://graph.facebook.com/${endpointVersion}/me/accounts`,
        { params: { access_token: userToken } }
    )
    if (!pages.data?.length) {
        throw new Error('No pages found for this user token.')
    }
    const page = pages.data[0]
    const pageId = page.id

    // 2. Fetch linked Instagram Business account
    const { data: pageInfo } = await axios.get(
        `https://graph.facebook.com/${endpointVersion}/${pageId}`,
        {
            params: {
                fields: 'instagram_business_account',
                access_token: userToken,
            },
        }
    )
    const igBusiness = pageInfo.instagram_business_account
    if (!igBusiness?.id) {
        throw new Error('This page has no Instagram Business account linked.')
    }

    return { pageId, igBusinessId: igBusiness.id }
}

//–– CREATE ––//
export const createSocialMediaPost = async (
    fbLongLivedAccessToken,
    caption,
    description,
    mediaUrl
) => {
    const { pageId, igBusinessId } = await getPageAndIgIds(fbLongLivedAccessToken)

    // 1) Create on Facebook Page
    const fbRes = await axios.post(
        `https://graph.facebook.com/${endpointVersion}/${pageId}/feed`,
        null,
        {
            params: {
                message: `${caption}\n\n${description}`,
                link: mediaUrl,
                access_token: fbLongLivedAccessToken,
            },
        }
    )

    // 2) Create on Instagram Business
    //  2a) Upload media container
    const igUpload = await axios.post(
        `https://graph.facebook.com/${endpointVersion}/${igBusinessId}/media`,
        null,
        {
            params: {
                image_url: mediaUrl,
                caption: `${caption}\n\n${description}`,
                access_token: fbLongLivedAccessToken,
            },
        }
    )
    const creationId = igUpload.data.id

    //  2b) Publish
    const igPublish = await axios.post(
        `https://graph.facebook.com/${endpointVersion}/${igBusinessId}/media_publish`,
        null,
        {
            params: {
                creation_id: creationId,
                access_token: fbLongLivedAccessToken,
            },
        }
    )

    return {
        facebookPostId: fbRes.data.id,
        instagramPostId: igPublish.data.id,
    }
}

//–– READ ––//
export const readSocialMediaPost = async (fbLongLivedAccessToken, postId) => {
    // Try Facebook first
    try {
        const fb = await axios.get(
            `https://graph.facebook.com/${endpointVersion}/${postId}`,
            {
                params: {
                    fields: 'id,message,permalink_url,created_time',
                    access_token: fbLongLivedAccessToken,
                },
            }
        )
        return { platform: 'facebook', data: fb.data }
    } catch (fbErr) {
        // If not FB, try Instagram
        const ig = await axios.get(
            `https://graph.facebook.com/${endpointVersion}/${postId}`,
            {
                params: {
                    fields: 'id,caption,media_url,permalink,timestamp',
                    access_token: fbLongLivedAccessToken,
                },
            }
        )
        return { platform: 'instagram', data: ig.data }
    }
}

//–– UPDATE ––//
// Facebook: you can only edit the message text. Instagram: no edit—delete & re-create.
export const updateSocialMediaPost = async (
    fbLongLivedAccessToken,
    postId,
    caption,
    description,
    mediaUrl
) => {
    // Determine platform by attempting FB edit
    try {
        const res = await axios.post(
            `https://graph.facebook.com/${endpointVersion}/${postId}`,
            null,
            {
                params: {
                    message: `${caption}\n\n${description}`,
                    access_token: fbLongLivedAccessToken,
                },
            }
        )
        return { platform: 'facebook', success: res.data.success }
    } catch {
        // Instagram doesn’t support edit
        throw new Error(
            'Instagram posts cannot be updated via API. Please delete and re-create.'
        )
    }
}

//–– DELETE ––//
export const deleteSocialMediaPost = async (fbLongLivedAccessToken, postId) => {
    const res = await axios.delete(
        `https://graph.facebook.com/${endpointVersion}/${postId}`,
        {
            params: { access_token: fbLongLivedAccessToken },
        }
    )
    return { success: res.data.success }
}
