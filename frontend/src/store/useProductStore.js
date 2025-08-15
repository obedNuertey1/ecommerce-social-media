// frontend\src\store\useProductStore.js
import { create } from "zustand";
import axios from "axios";
import { toast } from "react-hot-toast";
import { GoogleDriveAPI, GoogleSheetsAPI } from "../lib/googleLibs";
import { schemas } from "../schemas/initSheetSchema";
import { cancellableWaiting } from "../hooks/waiting";
import { createLogs, decryptData } from "../funcs/essentialFuncs";
import { addProductToCatalog, createProductCatalog, getCatalogProducts, updateProduct } from "../funcs/socialCrudFuncs";


const productSchema = schemas.find((schema) => schema.sheetName === "Products");
const GOOGLE_SPREADSHEET_NAME = import.meta.env.VITE_GOOGLE_SPREADSHEET_NAME;
const GOOGLE_DRIVE_NAME = import.meta.env.VITE_GOOGLE_DRIVE_NAME;
const ENCRYPT_DECRYPT_KEY = import.meta.env.VITE_ENCRYPT_DECRYPT_KEY;
const META_ACCESS_TOKEN = import.meta.env.VITE_META_PAGE_TOKEN;
const LONG_LIVED_META_ACCESS_TOKEN = import.meta.env.VITE_FACEBOOK_LONG_LIVED_TOKEN;

const passkeyName = localStorage.getItem("passkeyName");
const passkey = localStorage.getItem("passkey");

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "";

export const useProductStore = create((set, get) => ({
    products: [],
    error: null,
    loading: false,
    product: null,
    formData: {
        name: "",
        price: "",
        description: "",
        image: '',
        media: [],
        catalogueId: "",
        isNewCatalogue: false,
        newCatalogueName: "",
        inventoryQuantity: "",
        currency: "USD",
        color: "",
        size: "",
        brand: "",
        category: "",
        material: "",
        availability: "in stock",
        condition: "new",
        shipping_weight: "",
        shipping_weight_unit: "lb",
        custom_label_0: "",
        // NEW FIELDS
        sale_price: "",
        sale_price_effective_date: "",
        gtin: "",
        mpn: "",
        gender: "",
        age_group: "",
        pattern: "",
        size_type: "",
        size_system: "",
        product_type: "",
        tax: "",
        custom_label_1: "",
        custom_label_2: "",
        custom_label_3: "",
        custom_label_4: "",
        commerce_tax_category: ""
    },
    setFormData: (formData) => set({ formData }),
    resetFormData: () => set({
        formData: {
            name: "",
            price: "",
            description: "",
            image: '',
            media: [],
            catalogueId: "",
            isNewCatalogue: false,
            newCatalogueName: "",
            inventoryQuantity: "",
            currency: "USD",
            color: "",
            size: "",
            brand: "",
            category: "",
            material: "",
            availability: "in stock",
            condition: "new",
            shipping_weight: "",
            shipping_weight_unit: "lb",
            custom_label_0: "",
            // NEW FIELDS
            sale_price: "",
            sale_price_effective_date: "",
            gtin: "",
            mpn: "",
            gender: "",
            age_group: "",
            pattern: "",
            size_type: "",
            size_system: "",
            product_type: "",
            tax: "",
            custom_label_1: "",
            custom_label_2: "",
            custom_label_3: "",
            custom_label_4: "",
            commerce_tax_category: ""
        }
    }),
    updateProduct: async (id, gapi, imagesToDelete) => {
        set({ loading: true });
        try {
            const spreadsheetName = GOOGLE_SPREADSHEET_NAME;
            const sheetName = "Products";
            const { formData, product } = get();
            const newImagesToAdd = formData.media.filter((blob) => blob?.operation === "add");
            const imagesToUpdate = formData.media.filter((blob) => (blob?.operation === "update"));
            const getAllMediaInFolder = formData.media.map((blob) => {
                if (blob?.operation === "update" || !blob.hasOwnProperty("operation")) {
                    // console.log({blob})
                    const mediaId = product.mediaIds.find((media) => media?.id == blob?.id);
                    return {
                        id: mediaId.id,
                        name: mediaId.name,
                        mimeType: mediaId.mimeType
                    }
                }
                return null;
            })
                .filter((media) => media !== null);
            // console.log({newImagesToAdd, imagesToUpdate, imagesToDelete, product
            //     , getAllMediaInFolder
            // });
            const googleDrive = new GoogleDriveAPI(gapi);
            const googleSheet = new GoogleSheetsAPI(gapi);
            // console.log({folderId: product.mediaFolderId});
            // // update media in the product's folder
            const updateRes = await googleDrive.replaceMultipleFilesInFolder(product.mediaFolderId, imagesToUpdate);
            // // add new media to the prouduct's folder
            const drive = await googleDrive.addMultipleFilesToFolder(product.mediaFolderId, newImagesToAdd);
            // // delete media from the product's folder
            const deleteRes = await googleDrive.deleteMultipleFilesFromFolder(imagesToDelete);

            if (product.name !== formData.name) {
                const folderRenameRes = await googleDrive.renameFolder(product.mediaFolderId, formData.name);
            }
            const newMediaIds = [...getAllMediaInFolder, ...drive];

            // construct the spreadsheet row
            const updatedRow = {
                ...product,
                mediaIds: newMediaIds,
                name: formData.name,
                price: formData.price,
                description: formData.description
            }

            const sheetUpdateRes = await googleSheet.updateRowByRowId(spreadsheetName, productSchema.sheetName, productSchema.shape, updatedRow, id);

            if (passkey) {
                createLogs("Modified", `
                ${passkeyName} updated a product
                with name ${updatedRow.name}
                and price ${updatedRow.price}
                and description ${updatedRow.description}
                with ${updatedRow.mediaIds.length} media files`)
            }

            // await axios.put(`${BASE_URL}/api/products/${id}`, formData);
            await get().fetchProduct(id, gapi);
            toast.success("Product updated successfully");
        } catch (e) {
            console.log(`Error updating product: ${e}`);
            toast.error("Something went wrong");
        } finally {
            set({ loading: false });
        }
    },
    fetchProduct: async (id, gapi, retries = 10, error = null) => {
        if (retries === 0) {
            if (error) {
                set({ error: error, product: null, loading: false })
            }
            return;
        }
        set({ loading: true });
        const { promise, cancel } = cancellableWaiting(1000);
        try {
            const googleSheet = new GoogleSheetsAPI(gapi);
            const product = await googleSheet.getRowByIndexByName(GOOGLE_SPREADSHEET_NAME, "Products", id);
            set({ formData: { name: product.name, price: product.price, description: product.description, image: product.image, media: product.media }, error: null, product: product, loading: false });
            return;
        } catch (e) {
            console.warn(`Attempts ${Math.abs(11 - retries)} failed:`, e);
            error = "Something went wrong";
            await promise;
            await get().fetchProduct(id, gapi, retries - 1, error);
            cancel();
        }
    },
    addProduct: async (gapi) => {
        set({ loading: true });
        try {
            const { formData } = get();
            formData.price = (Number(formData.price)).toFixed(2);
            // create catalogue on facebook and instagram and get the catalogueId
            let catalogueId = null;
            if (formData.isNewCatalogue) {
                catalogueId = await createProductCatalog(LONG_LIVED_META_ACCESS_TOKEN, formData.catalogueName);
            }
            console.log({ catalogueId });
            const googleDrive = new GoogleDriveAPI(gapi);
            const googleSheet = new GoogleSheetsAPI(gapi);
            const mediaToDrive = formData.media.map((media) => media.file);
            const mediaUploadRes = await googleDrive.uploadFilesToDrive(GOOGLE_DRIVE_NAME, formData.name, mediaToDrive);

            const mediaIds = JSON.parse(mediaUploadRes.mediaIds).map((media) => media.id);
            const retailId = (function generateRetailerId() {
                return 'prod-' + Math.random().toString(36).substr(2, 9);
            })();
            // upload product to facebook and instagram and get the productId
            const productCatalogueId = formData.catalogueId || catalogueId;
            const productData = {
                name: formData.name,
                // price: `${Number(formData.price).toFixed(2)} ${formData.currency}`,
                price: Number(formData.price),
                currency: formData.currency,
                description: formData.description,
                url: "https://www.vicanalytica.com",
                ...(mediaIds.length > 0 && { image_url: `https://lh3.googleusercontent.com/d/${mediaIds[0]}=s800` }),
                ...(mediaIds?.length > 1 && { additional_image_urls: mediaIds.slice(1).map(id => `https://lh3.googleusercontent.com/d/${id}=s800`) }),
                ...(formData.availability && { availability: formData.availability }),
                ...(formData.condition && { condition: formData.condition }),
                ...(formData.shipping_weight && { shipping_weight_value: parseFloat(formData.shipping_weight), shipping_weight_unit: formData.shipping_weight_unit }),
                ...(formData.custom_label_0 && { custom_label_0: formData.custom_label_0 }),
                ...(formData.inventoryQuantity && { inventory: parseInt(formData.inventoryQuantity, 10) || 0 }),
                ...(formData.brand && { brand: formData.brand }),
                ...(formData.category && { google_product_category: formData.category }),
                ...(formData.material && { material: formData.material }),
                // NEW FIELDS
                ...(formData.sale_price_effective_date && { sale_price: Number(formData.sale_price) }),
                ...(formData.sale_price_effective_date && { sale_price_effective_date: formData.sale_price_effective_date }),
                ...(formData.gtin && { gtin: formData.gtin }),
                ...(formData.mpn && { mpn: formData.mpn }),
                ...(formData.gender && { gender: formData.gender }),
                ...(formData.age_group && { age_group: formData.age_group }),
                ...(formData.pattern && { pattern: formData.pattern }),
                ...(formData.size_type && { size_type: formData.size_type }),
                ...(formData.size_system && { size_system: formData.size_system }),
                ...(formData.product_type && { product_type: formData.product_type }),
                ...(formData.tax && { tax: formData.tax }),
                ...(formData.custom_label_1 && { custom_label_1: formData.custom_label_1 }),
                ...(formData.custom_label_2 && { custom_label_2: formData.custom_label_2 }),
                ...(formData.custom_label_3 && { custom_label_3: formData.custom_label_3 }),
                ...(formData.custom_label_4 && { custom_label_4: formData.custom_label_4 }),
                commerce_tax_category: formData.commerce_tax_category,
                retailer_id: retailId
            }
            productData["retailer_id"] = retailId
            const product = await addProductToCatalog(LONG_LIVED_META_ACCESS_TOKEN, productCatalogueId, productData);
            console.log({ product });
            // if upload to facebook and instagram posts is true
            // upload product to facebook and instagram posts and get the postid
            const data = {
                name: formData.name,
                price: formData.price,
                description: formData.description,
                currency: formData.currency,
                color: formData.color,
                size: formData.size,
                brand: formData.brand,
                category: formData.category,
                material: formData.material,
                availability: formData.availability,
                condition: formData.condition,
                shipping_weight: formData.shipping_weight,
                shipping_weight_unit: formData.shipping_weight_unit,
                custom_label: formData.custom_label_0,
                inventoryQuantity: formData.inventoryQuantity,
                productCatalogueId: productCatalogueId,
                ...mediaUploadRes,
                // New fields
                sale_price: formData.sale_price,
                sale_price_effective_date: formData.sale_price_effective_date,
                gtin: formData.gtin,
                mpn: formData.mpn,
                gender: formData.gender,
                age_group: formData.age_group,
                pattern: formData.pattern,
                size_type: formData.size_type,
                size_system: formData.size_system,
                product_type: formData.product_type,
                tax: formData.tax,
                custom_label_1: formData.custom_label_1,
                custom_label_2: formData.custom_label_2,
                custom_label_3: formData.custom_label_3,
                custom_label_4: formData.custom_label_4,
                // facebookProductPostId,
                // instagramProductPostId,
                // facebookCatalogueId,
                // instagramCatalogueId,
                // facebookProductId,
                // instagramProductId,
            }

            const {
                facebookLongLivedAccessToken } = await googleSheet.getRowByIndexByName(GOOGLE_SPREADSHEET_NAME, "Auth", 2);
            const decryptFacebookLongLivedAccessToken = await decryptData(facebookLongLivedAccessToken, ENCRYPT_DECRYPT_KEY);
            console.log({ decryptFacebookLongLivedAccessToken, facebookLongLivedAccessToken })

            // decryptFacebookLongLivedAccessToken, mediaIds
            console.log({ decryptFacebookLongLivedAccessToken, mediaIds });

            await googleSheet.appendRowInPage(GOOGLE_SPREADSHEET_NAME, productSchema.sheetName, data, productSchema.shape);

            if (passkey) {
                createLogs("Created", `
                ${passkeyName} created a new product
                with name ${data.name}
                and price ${data.price}
                and description ${data.description}
                with ${JSON.parse(data.mediaIds).length} media files`)
            }

            set({ formData: { name: "", price: "", description: "", image: "", media: [] }, error: null });
            document.getElementById("my_modal_2").close();
            toast.success("Product added successfully");

            await get().fetchProducts(gapi);
        } catch (e) {
            console.log(`Error adding product: ${e}`);
            toast.error("Something went wrong");
        } finally {
            set({ loading: false });
        }
    },
    deleteProduct: async (id, gapi, mediaFolderId) => {
        set({ loading: true });
        try {
            const googleDrive = new GoogleDriveAPI(gapi);
            const googleSheet = new GoogleSheetsAPI(gapi);
            // First Delete folder containing the media from google drive if this is successfull
            const driveResult = await googleDrive.deleteFolderAndContents(mediaFolderId);
            // Delete row from google sheet using the spreadSheetName, sheetName, and rowIndex
            // console.log({index: id})
            const sheetResult = await googleSheet.deleteRowAtIndexByName(GOOGLE_SPREADSHEET_NAME, "Products", id - 1);
            if (passkey) {
                createLogs("Deleted", `${passkeyName} deleted a product with id ${id}`)
            }

            set((prev) => (
                { products: prev.products.filter((product) => product.id !== id) }
            ));
            toast.success("Product deleted successfully");
        } catch (e) {
            console.log(`Error deleting product: ${e}`);
            toast.error("Something went wrong");
        } finally {
            set({ loading: false });
        }
    },
    fetchProducts: async (gapi, retries = 10, error = null) => {
        if (retries === 0) {
            if (error) {
                set({ error: error, products: [], loading: false })
            }
            return;
        }
        set({ loading: true });
        const { promise, cancel } = cancellableWaiting(1000);
        try {
            const googleSheet = new GoogleSheetsAPI(gapi);
            const products = await googleSheet.getSpreadsheetValuesByName(GOOGLE_SPREADSHEET_NAME, "Products");
            set({ products: products.reverse(), error: null, loading: false });
            return;
        } catch (e) {
            console.warn(`Attempts ${Math.abs(11 - retries)} failed:`, e);
            error = "Something went wrong";
            await promise;
            await get().fetchProducts(gapi, retries - 1, error);
            cancel();
        }
    }
}));