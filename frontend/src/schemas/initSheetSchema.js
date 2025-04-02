export const schemas = [
    { sheetName: "Sheet1", shape: ["ID", "Name", "Price", "Description", "Location"] },
    { sheetName: "Accounts", shape: ["UserID", "Username", "Email", "Password"] },
    { sheetName: "Products", shape: ["name", "price", "description", "mediaFolderId", "mediaIds", "facebookPostId", "instagramPostId", "threadsPostId", "analytics", "biddable", "bidderEmail", "bidDate"]}
    ,
    { sheetName: "Orders", shape: ["phone", "items", "total", "orderId", "status"]}
    ,
    { sheetName: "NewOrders", shape: ["phone", "items", "total", "orderId", "status"]},
    { sheetName: "Auth", shape: ["googleUserId", "googleAccessToken", "googleRefreshToken", "facebookUserId", "facebookAccessToken", "facebookRefreshToken", "threadsUserId", "threadsAccessToken", "threadsRefreshToken", "instagramUserId", "instagramAccessToken", "instagramRefreshToken", "businessProfileId"]},
    // { sheetName: "Settings", shape: ["address", "autoPost"] },
];