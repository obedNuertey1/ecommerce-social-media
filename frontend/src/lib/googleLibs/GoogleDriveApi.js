// .libs/googleLibs/GoogleDriveApi.js
class GoogleDriveAPI {
    constructor(gapi) {
        this.gapi = gapi;
    }

    /**
     * Creates a folder with the given name.
     *
     * @param {string} folderName - The name of the folder to create.
     * @returns {Promise<Object>} A promise that resolves with the folder data.
     */
    createFolder(folderName) {
        const fileMetadata = {
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
        };
        const accessToken = this.gapi.auth.getToken().access_token;

        return fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(fileMetadata),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error creating folder: " + response.statusText);
                }
                return response.json();
            })
            .then(async (data) => {
                // console.log("Folder created with ID:", data.id);
                const folderId = data.id;
                try {
                    await fetch(
                        `https://www.googleapis.com/drive/v3/files/${folderId}/permissions?fields=id`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify({
                                role: "writer",
                                type: "anyone",
                                allowFileDiscovery: false,
                            }),
                        }
                    )

                    return data;
                } catch (e) {
                    console.log(e)
                    throw new Error("Error creating permissions: " + e);
                }
            })
            .catch((error) => {
                console.error("Error creating folder:", error);
                throw error;
            });
    }

    /**
     * Uploads a file into a folder with the given name.
     * If the folder doesn't exist, it will be created.
     *
     * @param {string} folderName - The name of the target folder.
     * @param {File|Blob} fileObject - The file object to upload.
     * @returns {Promise<Object>} A promise that resolves when the file is uploaded.
     */
    postFileToFolder(folderName, fileObject) {
        const accessToken = this.gapi.auth.getToken().access_token;
        // URL-encode the query parameter for safety
        const query = encodeURIComponent(
            `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
        );

        // Step 1: Look for a folder with the given name
        return fetch(
            `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error listing folders: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                let folderId;
                if (data.files && data.files.length > 0) {
                    // Folder exists—use its ID
                    folderId = data.files[0].id;
                    return this.uploadFileToFolder(folderId, fileObject);
                } else {
                    // Folder doesn't exist—create it
                    const folderMetadata = {
                        name: folderName,
                        mimeType: "application/vnd.google-apps.folder",
                    };

                    return fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(folderMetadata),
                    })
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error(
                                    "Error creating folder: " + response.statusText
                                );
                            }
                            return response.json();
                        })
                        .then((createResponse) => {
                            folderId = createResponse.id;
                            return this.uploadFileToFolder(folderId, fileObject);
                        })
                        .catch((error) => {
                            console.error("Error creating folder:", error);
                            throw error;
                        });
                }
            })
            .catch((error) => {
                console.error("Error listing folders:", error);
                throw error;
            });
    }

    /**
 * Renames a folder using its folder ID.
 *
 * @param {string} folderId - The ID of the folder to rename.
 * @param {string} newName - The new name for the folder.
 * @returns {Promise<Object>} A promise that resolves with the updated folder data.
 */
    renameFolder(folderId, newName) {
        const accessToken = this.gapi.auth.getToken().access_token;
        return fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ name: newName }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error renaming folder: " + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log("Folder renamed successfully:", data);
                return data;
            })
            .catch(error => {
                console.error("Error renaming folder:", error);
                throw error;
            });
    }


    /**
     * Uploads a file to a folder by setting its parent.
     *
     * @param {string} folderId - The ID of the folder to upload the file to.
     * @param {File|Blob} fileObject - The file object to upload.
     * @returns {Promise<Object>} A promise that resolves with the upload response.
     */
    postFileToFolderById(folderId, fileObject) {
        const accessToken = this.gapi.auth.getToken().access_token;
        const fileMetadata = {
            name: fileObject.name,
            parents: [folderId],
        };

        // Prepare a FormData object for multipart upload
        const formData = new FormData();
        formData.append(
            "metadata",
            new Blob([JSON.stringify(fileMetadata)], { type: "application/json" })
        );
        formData.append("file", fileObject);

        return fetch(
            // "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name",
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    contentType: 'multipart/form-data'
                    // Let the browser set Content-Type with proper boundaries.
                },
                body: formData,
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error uploading file: " + response.statusText);
                }
                return response.json();
            })
            .then(async (data) => {
                // console.log("File uploaded:", data);
                const fileId = data.id;
                try {
                    await fetch(
                        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions?fields=id`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify({
                                role: "writer",
                                type: "anyone",
                                allowFileDiscovery: false,
                            }),
                        }
                    )

                    return data;
                } catch (e) {
                    console.log(e)
                    throw new Error("Error creating permissions: " + e);
                }
            })
            .catch((error) => {
                console.error("Error uploading file:", error);
                throw error;
            });
    }

    async addMultipleFilesToFolder(folderId, blobArray) {
        try {
            if (blobArray.length === 0) {
                console.log("There are no files to add to the folder");
                return [];
            }
            const resultArr = [];
            for (let i = 0; i < blobArray.length; i++) {
                const resp = await this.postFileToFolderById(folderId, blobArray[i]?.file);
                resultArr.push(resp);
            }

            return resultArr;
        } catch (e) {
            console.log("Error occurred while adding files");
            return "Files addition unsuccessful"
        }
    }

    /**
     * Removes a file from a specific folder.
     *
     * @param {string} fileId - The ID of the file to remove.
     * @returns {Promise<Response>} A promise that resolves when deletion is complete.
     */
    deleteFileFromFolder(fileId) {
        const accessToken = this.gapi.auth.getToken().access_token;
        return fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error deleting file: " + response.statusText);
                }
                // console.log("File removed from folder");
                return response;
            })
            .catch((error) => {
                console.error("Error removing file from folder:", error);
                throw error;
            });
    }

    async deleteMultipleFilesFromFolder(blobArray) {
        try {
            if (blobArray.length === 0) {
                console.log("There are no files to delete");
                return;
            }
            for (let i = 0; i < blobArray.length; i++) {
                await this.deleteFileFromFolder(blobArray[i]?.id)
            }
            return "finished files deletion";
        } catch (e) {
            console.log("Error occurred while deleting files");
            return "Files deletion unsuccessful"
        }
    }

    /**
     * Replaces the content of an existing file in a specific folder with a new file.
     *
     * @param {string} folderId - The ID of the folder in which the file should reside.
     * @param {string} fileId - The ID of the file to update.
     * @param {File|Blob} newFile - The new file (or Blob) to use as the content.
     * @returns {Promise<Object>} A promise that resolves with the updated file data.
     */
    // replaceFileInFolder(folderId, fileId, newFile) {
    //     try{
    //         const accessToken = this.gapi.auth.getToken().access_token;
    //     const fileMetadata = {
    //         name: newFile.name,
    //         parents: [folderId],
    //     };

    //     // Prepare FormData for the multipart update
    //     const formData = new FormData();
    //     formData.append(
    //         "metadata",
    //         new Blob([JSON.stringify(fileMetadata)], { type: "application/json" })
    //     );
    //     formData.append("file", newFile);

    //     return fetch(
    //         `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart&fields=id,name,mimeType`,
    //         {
    //             method: "PATCH",
    //             headers: {
    //                 Authorization: `Bearer ${accessToken}`,
    //                 // Do not manually set Content-Type header.
    //             },
    //             body: formData,
    //         }
    //     )
    //         .then((response) => {
    //             if (!response.ok) {
    //                 throw new Error("Error updating file: " + response.statusText);
    //             }
    //             return response.json();
    //         })
    //         .then((data) => {
    //             // console.log("File successfully updated:", data);
    //             return data;
    //         })
    //         .catch((error) => {
    //             console.error("Error updating file:", error);
    //             throw error;
    //         });
    //     }catch(error){
    //         console.log("An error occurred:",error);
    //         throw error;
    //     }
    // }
    replaceFileInFolder(folderId, fileId, newFile) {
        try {
            const accessToken = this.gapi.auth.getToken().access_token;
            const fileMetadata = {
                name: newFile.name,
                // parents: [folderId],
                // Removed 'parents' since it's read-only in updates
            };
    
            const formData = new FormData();
            formData.append(
                "metadata",
                new Blob([JSON.stringify(fileMetadata)], { type: "application/json" })
            );
            formData.append("file", newFile);
    
            return fetch(
                `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart&fields=id,name,mimeType`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: formData,
                }
            )
            .then((response) => {
                if (!response.ok) {
                    // Log detailed error
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then((data) => {
                console.log("File updated:", data);
                return data;
            })
            .catch((error) => {
                console.error("Error:", error.error || error);
                throw error;
            });
        } catch(error) {
            console.error("Exception:", error);
            throw error;
        }
    }

    async replaceMultipleFilesInFolder(folderId, blobArray) {
        try {
            if (blobArray.length === 0) {
                console.log("There are no files to replace in the folder");
                return;
            }

            const resultArr = [];

            for (let i = 0; i < blobArray.length; i++) {
                console.log({blob: blobArray[i]})
                const resp = await this.replaceFileInFolder(folderId, blobArray[i]?.id, blobArray[i]?.file);
                resultArr.push(resp);
            }

            return resultArr;
        } catch (e) {
            console.log("Error occurred while replacing files");
            throw new Error(`Files replacement unsuccessful ${e}`);
        }
    }

    /**
     * Recursively deletes a folder and all its contents (files and subfolders).
     *
     * @param {string} folderId - The ID of the folder to delete.
     * @returns {Promise<Response>} A promise that resolves when deletion is complete.
     */
    // deleteFolderAndContents(folderId) {
    //     const accessToken = this.gapi.auth.getToken().access_token;
    //     // List all files in the folder.
    //     const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
    //     return fetch(
    //         `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,mimeType)`,
    //         {
    //             headers: {
    //                 Authorization: `Bearer ${accessToken}`,
    //             },
    //         }
    //     )
    //         .then((response) => {
    //             if (!response.ok) {
    //                 throw new Error(
    //                     "Error listing folder contents: " + response.statusText
    //                 );
    //             }
    //             return response.json();
    //         })
    //         .then((data) => {
    //             const files = data.files || [];
    //             // Create deletion promises for each file.
    //             const deletePromises = files.map((file) => {
    //                 if (file.mimeType === "application/vnd.google-apps.folder") {
    //                     // Recursively delete subfolders.
    //                     return this.deleteFolderAndContents(file.id);
    //                 } else {
    //                     return fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
    //                         method: "DELETE",
    //                         headers: {
    //                             Authorization: `Bearer ${accessToken}`,
    //                         },
    //                     });
    //                 }
    //             });
    //             return Promise.all(deletePromises);
    //         })
    //         .then(() => {
    //             // Delete the folder itself.
    //             return fetch(`https://www.googleapis.com/drive/v3/files/${folderId}`, {
    //                 method: "DELETE",
    //                 headers: {
    //                     Authorization: `Bearer ${accessToken}`,
    //                 },
    //             });
    //         })
    //         .then((response) => {
    //             if (!response.ok) {
    //                 throw new Error("Error deleting folder: " + response.statusText);
    //             }
    //             console.log("Folder and its contents have been deleted");
    //             return response;
    //         })
    //         .catch((error) => {
    //             console.error("Error deleting folder and its contents:", error);
    //             throw error;
    //         });
    // }
    deleteFolderAndContents(folderId) {
        const accessToken = this.gapi.auth.getToken().access_token;
        // Construct the query string correctly.
        const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
        return fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,mimeType)`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error listing folder contents: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                const files = data.files || [];
                // Create deletion promises for each file.
                const deletePromises = files.map((file) => {
                    if (file.mimeType === "application/vnd.google-apps.folder") {
                        // Recursively delete subfolders.
                        return this.deleteFolderAndContents(file.id);
                    } else {
                        return fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
                            method: "DELETE",
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        });
                    }
                });
                return Promise.all(deletePromises);
            })
            .then(() => {
                // Delete the folder itself.
                return fetch(`https://www.googleapis.com/drive/v3/files/${folderId}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
            })
            .then((response) => {
                // If the folder was not found, consider it already deleted.
                if (response.status === 404) {
                    console.warn("Folder not found, it may have already been deleted.");
                    return;
                }
                if (!response.ok) {
                    throw new Error("Error deleting folder: " + response.statusText);
                }
                // console.log("Folder and its contents have been deleted");
                return response;
            })
            .catch((error) => {
                console.error("Error deleting folder and its contents:", error);
                throw error;
            });
    }


    /**
     * Retrieves all files within a specified folder.
     *
     * @param {string} folderId - The ID of the folder to list files from.
     * @returns {Promise<Array>} A promise that resolves to an array of file objects.
     */
    listFilesInFolder(folderId) {
        const accessToken = this.gapi.auth.getToken().access_token;
        return fetch(
            `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType)`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error listing files: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                const files = data.files;
                // console.log("Files in folder:", files);
                return files;
            })
            .catch((error) => {
                console.error("Error listing files:", error);
                throw error;
            });
    }

    /**
     * Retrieves all folders within a specified parent folder.
     *
     * @param {string} parentFolderId - The ID of the parent folder.
     * @returns {Promise<Array>} A promise that resolves to an array of folder objects.
     */
    listFoldersInFolder(parentFolderId) {
        const accessToken = this.gapi.auth.getToken().access_token;
        return fetch(
            `https://www.googleapis.com/drive/v3/files?q='${parentFolderId}'+in+parents+and+trashed=false+and+mimeType='application/vnd.google-apps.folder'&fields=files(id,name)`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error listing folders: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                const folders = data.files;
                // console.log("Folders in parent folder:", folders);
                return folders;
            })
            .catch((error) => {
                console.error("Error listing folders:", error);
                throw error;
            });
    }

    /**
     * Retrieves the first file in a folder.
     *
     * @param {string} folderId - The ID of the folder to search.
     * @returns {Promise<Object|null>} A promise that resolves to the first file object or null if no file is found.
     */
    getFirstFileInFolder(folderId) {
        const accessToken = this.gapi.auth.getToken().access_token;
        return fetch(
            `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType)&pageSize=1`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        "Error retrieving the first file: " + response.statusText
                    );
                }
                return response.json();
            })
            .then((data) => {
                const files = data.files;
                if (files && files.length > 0) {
                    // console.log("First file:", files[0]);
                    return files[0];
                } else {
                    // console.log("No files found in the folder");
                    return null;
                }
            })
            .catch((error) => {
                console.error("Error retrieving the first file:", error);
                throw error;
            });
    }

    getFolder(folderName) {
        const accessToken = this.gapi.auth.getToken().access_token;
        const query = encodeURIComponent(
            `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
        );

        return fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error fetching folder: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                if (data.files && data.files.length > 0) {
                    // console.log("Folder found:", data.files[0]);
                    return data.files[0];
                } else {
                    // console.log("Folder not found with name:", folderName);
                    return null;
                }
            })
            .catch((error) => {
                console.error("Error getting folder by name:", error);
                throw error;
            });
    }

    /**
     * Creates the folder if it doesn't exist.
     *
     * @param {string} folderName - The name of the folder.
     * @returns {Promise<Object>} A promise that resolves with the existing or newly created folder data.
     */
    createFolderIfNotExists(folderName) {
        return this.getFolder(folderName)
            .then((folder) => {
                if (folder) {
                    return folder;
                } else {
                    return this.createFolder(folderName);
                }
            })
            .catch((error) => {
                console.error("Error ensuring folder exists:", error);
                throw error;
            });
    }

    /**
 * Retrieves a folder that is located within a specified parent folder.
 *
 * @param {string} parentFolderId - The ID of the parent folder.
 * @param {string} folderId - The ID of the folder to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves with the folder data (id, name, parents)
 * if found, or null if not found.
 */
    getFolderInParent(parentFolderId, folderId) {
        const accessToken = this.gapi.auth.getToken().access_token;
        const query = encodeURIComponent(
            `'${parentFolderId}' in parents and id = '${folderId}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
        );

        return fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,parents)`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error fetching folder in parent: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                if (data.files && data.files.length > 0) {
                    // console.log("Folder in parent found:", data.files[0]);
                    return data.files[0];
                } else {
                    // console.log("Folder not found within parent.");
                    return null;
                }
            })
            .catch((error) => {
                console.error("Error getting folder in parent:", error);
                throw error;
            });
    }

    /**
   * Retrieves a folder within a parent folder specified by the parent's name.
   *
   * This method:
   * 1. Uses getFolder to find the parent folder by its name.
   * 2. If found, uses the parent's ID to search for the child folder (with the given folderId) within it.
   *
   * @param {string} parentFolderName - The name of the parent folder.
   * @param {string} folderId - The ID of the folder to retrieve within the parent.
   * @returns {Promise<Object|null>} A promise that resolves with the folder data if found,
   * or null if either the parent or child folder is not found.
   */
    getFolderInParentByName(parentFolderName, folderId) {
        // First, get the parent folder by name.
        return this.getFolder(parentFolderName)
            .then((parentFolder) => {
                if (!parentFolder) {
                    throw new Error("Parent folder with name '" + parentFolderName + "' not found.");
                }
                // With the parent's ID, call getFolderInParent.
                return this.getFolderInParent(parentFolder.id, folderId);
            })
            .catch((error) => {
                console.error("Error in getFolderInParentByName:", error);
                throw error;
            });
    }

    /**
  * Creates a new folder within a specified parent folder.
  *
  * This method takes in the parent folder's name and the new folder's name,
  * ensures the parent folder exists (creating it if necessary), and then creates
  * the new folder within that parent.
  *
  * @param {string} parentFolderName - The name of the parent folder.
  * @param {string} newFolderName - The name of the new folder to create inside the parent.
  * @returns {Promise<Object>} A promise that resolves with the newly created folder's data.
  */
    createFolderInParent(parentFolderName, newFolderName) {
        const accessToken = this.gapi.auth.getToken().access_token;
        // Ensure the parent folder exists.
        return this.createFolderIfNotExists(parentFolderName)
            .then((parentFolder) => {
                const parentId = parentFolder.id;
                const fileMetadata = {
                    name: newFolderName,
                    mimeType: "application/vnd.google-apps.folder",
                    parents: [parentId],
                };

                return fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(fileMetadata),
                });
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error creating folder in parent: " + response.statusText);
                }
                return response.json();
            })
            .then(async (data) => {
                // console.log("Folder created in parent with ID:", data.id);
                const folderId = data.id;
                try {
                    await fetch(
                        `https://www.googleapis.com/drive/v3/files/${folderId}/permissions?fields=id`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify({
                                role: "writer",
                                type: "anyone",
                                allowFileDiscovery: false,
                            }),
                        }
                    )

                    return data;
                } catch (e) {
                    console.log(e)
                    throw new Error("Error creating permissions: " + e);
                }
            })
            .catch((error) => {
                console.error("Error creating folder in parent:", error);
                throw error;
            });
    }
    /**
     * Creates a new folder within a specified parent folder using the parent's ID.
     *
     * @param {string} parentFolderId - The ID of the parent folder.
     * @param {string} newFolderName - The name of the new folder to create.
     * @returns {Promise<Object>} A promise that resolves with the newly created folder's data.
     */
    createFolderInParentById(parentFolderId, newFolderName) {
        const fileMetadata = {
            name: newFolderName,
            mimeType: "application/vnd.google-apps.folder",
            parents: [parentFolderId],
        };
        const accessToken = this.gapi.auth.getToken().access_token;

        return fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(fileMetadata),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error creating folder in parent: " + response.statusText);
                }
                return response.json();
            })
            .then(async (data) => {
                // console.log("Folder created in parent with ID:", data.id);
                const folderId = data.id;
                try {
                    await fetch(
                        `https://www.googleapis.com/drive/v3/files/${folderId}/permissions?fields=id`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify({
                                role: "writer",
                                type: "anyone",
                                allowFileDiscovery: false,
                            }),
                        }
                    )

                    return data;
                } catch (e) {
                    console.log(e)
                    throw new Error("Error creating permissions: " + e);
                }
            })
            .catch((error) => {
                console.error("Error creating folder in parent:", error);
                throw error;
            });
    }

    async uploadFilesToDrive(parentFolderName, newFolderName, files) {
        // Create the new folder in the parent folder. and get the new folder's id
        const newFolder = await this.createFolderInParent(parentFolderName, newFolderName);
        // console.log("New folder created:", newFolder);
        // Post the files to the new folder with the id
        let filesIds = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const uploadedfileInfo = await this.postFileToFolderById(newFolder.id, file);
            filesIds.push(uploadedfileInfo);

        }
        return { mediaFolderId: newFolder.id, mediaIds: JSON.stringify(filesIds) };
        // return the new folder's id and the files that were posted ids
    }
}

export default GoogleDriveAPI;