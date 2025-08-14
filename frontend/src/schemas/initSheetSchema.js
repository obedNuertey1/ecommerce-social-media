export const schemas = [
    { sheetName: "Sheet1", shape: ["ID", "Name", "Price", "Description", "Location"] },
    { sheetName: "Accounts", shape: ["UserID", "Username", "Email", "Password"] },
    { sheetName: "Products", shape: ["name", "price", "currency", "color", "size", "brand", "category", "material", "availability", "condition", "shipping_weight", "shipping_weight_unit", "custom_label", "productCatalogueId", "inventoryQuantity", "description", "mediaFolderId", "mediaIds", "postId", "productId", "facebookPostId", "facebookProductId", "facebookCatalogueId", "instagramPostId", "instagramProductId", "instagramCatalogueId", "threadsPostId", "analytics", "biddable", "bidderEmail", "bidDate"]}
    ,
    { sheetName: "Orders", shape: ["phone", "items", "total", "orderId", "status"]}
    ,
    { sheetName: "NewOrders", shape: ["phone", "items", "total", "orderId", "status"]},
    { sheetName: "Auth", shape: ["googleUserId", "googleRefreshToken", "googleRefreshTokenExpires" , "facebookUserId", "facebookLongLivedAccessToken", "facebookLongLivedAccessTokenExpires", "threadsUserId", "threadsLongLivedAccessToken", "threadsLongLivedAccessTokenExpires", "instagramUserId", "instagramLongLivedAccessToken", "instagramLongLivedAccessTokenExpires", "businessProfileId"]},
    { sheetName: "Passkeys", shape: [
        "name",
        "passkey", 
        "privileges", // privileges: admin, editor, viewer, billing  an array of strings
        "accessiblePages", // page privileges an array of strings
        "dateCreated", 
        "dateModified",
        "isOnline"
    ]},
    { sheetName: "PasskeyLogs", shape: [
        "passkeyName",
        "privileges",
        "accessiblePages",
        "activity",
        "activityDetails",
        "date"
    ]}
    // modified
];