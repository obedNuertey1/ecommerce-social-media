// ./lib/googleLibs/GoogleSheetsApi.js
import { convert2dArrToObjArr, getMediaUrls } from "../../funcs/essentialFuncs";
import { schemas } from "../../schemas/initSheetSchema"

class GoogleSheetsAPI {
    constructor(gapi) {
        this.gapi = gapi;
    }

    /**
     * Creates a new spreadsheet with the given title.
     *
     * Adds an appProperty to indicate it was created by your app.
     *
     * @param {string} title - The title of the new spreadsheet.
     * @returns {Promise<Object>} A promise that resolves with the created spreadsheet data.
     */
    createSpreadsheet(title) {
        const accessToken = this.gapi.auth.getToken().access_token;
        const payload = {
            properties: { title: title }
        };

        return fetch("https://sheets.googleapis.com/v4/spreadsheets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error creating spreadsheet: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                const spreadsheetId = data.spreadsheetId;
                // Set permission so that anyone with the link can edit.
                return fetch(
                    `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions?fields=id`,
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
                    .then((resp) => {
                        if (!resp.ok) {
                            throw new Error("Error setting permission: " + resp.statusText);
                        }
                        return resp.json();
                    })
                    .then((permissionData) => {
                        const shareableLink = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
                        return {
                            ...data,
                            shareableLink: shareableLink,
                        };
                    });
            })
            .catch((error) => {
                console.error("Error creating spreadsheet:", error);
                throw error;
            });
    }



    /**
     * Retrieves values from a specified range in a spreadsheet.
     */
    getSpreadsheetValues(spreadsheetId, range) {
        const accessToken = this.gapi.auth.getToken().access_token;

        return fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error retrieving spreadsheet values: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                // console.log("Retrieved values:", data);
                return data;
            })
            .catch((error) => {
                console.error("Error retrieving spreadsheet values:", error);
                throw error;
            });
    }

    async getSpreadsheetValuesByName(spreadsheetName, sheetName) {

        // get spreadsheet by name
        try {
            const spreadsheet = await this.getSpreadsheetByName(spreadsheetName);
            if (!spreadsheet) {
                throw new Error(`Spreadsheet with name "${spreadsheetName}" not found.`);
            }
            const spreadsheetId = spreadsheet.spreadsheetId || spreadsheet.id;
            const result = await this.getSpreadsheetValues(spreadsheetId, sheetName);
            // console.log("googl", { result })
            // result.values
            const resultObjArr = await convert2dArrToObjArr(result.values);

            const finalResult = await getMediaUrls(resultObjArr);
            console.log({ finalResult });
            return finalResult;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async getSpreadsheetValuesByName2(spreadsheetName, sheetName) {

        // get spreadsheet by name
        try {
            const spreadsheet = await this.getSpreadsheetByName(spreadsheetName);
            if (!spreadsheet) {
                throw new Error(`Spreadsheet with name "${spreadsheetName}" not found.`);
            }
            const spreadsheetId = spreadsheet.spreadsheetId || spreadsheet.id;
            const result = await this.getSpreadsheetValues(spreadsheetId, sheetName);
            // console.log("googl", { result })
            // result.values
            const finalResult = await convert2dArrToObjArr(result.values);

            return finalResult;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    /**
     * Updates values in a specified range of a spreadsheet.
     */
    updateSpreadsheetValues(spreadsheetId, range, values, valueInputOption = "USER_ENTERED") {
        const accessToken = this.gapi.auth.getToken().access_token;
        const payload = { range, values };

        return fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=${valueInputOption}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error updating spreadsheet values: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                return data;
            })
            .catch((error) => {
                console.error("Error updating spreadsheet values:", error);
                throw error;
            });
    }

    /**
     * Appends values to a specified range of a spreadsheet.
     */
    appendSpreadsheetValues(
        spreadsheetId,
        range,
        values,
        valueInputOption = "USER_ENTERED",
        insertDataOption = "INSERT_ROWS"
    ) {
        const accessToken = this.gapi.auth.getToken().access_token;
        const payload = { range, values };

        return fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=${valueInputOption}&insertDataOption=${insertDataOption}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error appending spreadsheet values: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                // console.log("Spreadsheet values appended:", data);
                return data;
            })
            .catch((error) => {
                console.error("Error appending spreadsheet values:", error);
                throw error;
            });
    }

    /**
     * Clears values in a specified range of a spreadsheet.
     */
    clearSpreadsheetValues(spreadsheetId, range) {
        const accessToken = this.gapi.auth.getToken().access_token;

        return fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error clearing spreadsheet values: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                // console.log("Spreadsheet values cleared:", data);
                return data;
            })
            .catch((error) => {
                console.error("Error clearing spreadsheet values:", error);
                throw error;
            });
    }

    /**
     * Creates a new sheet (page) in an existing spreadsheet.
     */
    createSheetPage(spreadsheetId, sheetTitle) {
        const accessToken = this.gapi.auth.getToken().access_token;
        const payload = {
            requests: [
                { addSheet: { properties: { title: sheetTitle } } },
            ],
        };

        return fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error creating sheet page: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                // console.log(`Sheet "${sheetTitle}" created:`, data);
                return data;
            })
            .catch((error) => {
                console.error("Error creating sheet page:", error);
                throw error;
            });
    }

    /**
     * Sets the header section of a spreadsheet.
     *
     * Updates the first row of the specified sheet with the provided header array.
     */
    setHeaderSection(spreadsheetId, sheetName, headerArray, valueInputOption = "USER_ENTERED") {
        const accessToken = this.gapi.auth.getToken().access_token;
        const range = `${sheetName}!1:1`;
        const payload = { range, values: [headerArray] };

        return fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=${valueInputOption}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload),
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error setting header section: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                // console.log("Header section updated:", data);
                return data;
            })
            .catch((error) => {
                console.error("Error setting header section:", error);
                throw error;
            });
    }

    /**
     * Deletes a spreadsheet.
     *
     * Uses the Drive API endpoint since spreadsheets are stored as Drive files.
     */
    deleteSpreadsheet(spreadsheetId) {
        const accessToken = this.gapi.auth.getToken().access_token;
        return fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error deleting spreadsheet: " + response.statusText);
                }
                // console.log("Spreadsheet deleted");
                return response;
            })
            .catch((error) => {
                console.error("Error deleting spreadsheet:", error);
                throw error;
            });
    }

    /**
     * Retrieves the sheetId for a given sheet name in the spreadsheet.
     *
     * @param {string} spreadsheetId - The ID of the spreadsheet.
     * @param {string} sheetName - The title of the sheet.
     * @returns {Promise<number>} A promise that resolves with the sheetId.
     */
    getSheetIdByName(spreadsheetId, sheetName) {
        const accessToken = this.gapi.auth.getToken().access_token;
        return fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error retrieving spreadsheet metadata: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                const sheets = data.sheets;
                const sheet = sheets.find((s) => s.properties.title === sheetName);
                if (!sheet) {
                    throw new Error("Sheet with name " + sheetName + " not found.");
                }
                return sheet.properties.sheetId;
            })
            .catch((error) => {
                console.error("Error retrieving sheet ID:", error);
                throw error;
            });
    }

    /**
     * Deletes a row in a sheet by searching for a unique identity value in a given column.
     *
     * This method:
     * 1. Retrieves all rows from the specified sheet.
     * 2. Locates the row where the cell in the identity column matches identityValue.
     * 3. Retrieves the sheetId for the sheet.
     * 4. Sends a batchUpdate request with a deleteDimension request to remove the row.
     *
     * @param {string} spreadsheetId - The ID of the spreadsheet.
     * @param {string} sheetName - The name of the sheet.
     * @param {any} identityValue - The unique value to search for.
     * @param {string} identityColumn - The column letter (e.g., "A") where the identity is located.
     * @returns {Promise<Object>} A promise that resolves with the deletion response.
     */
    deleteRowByIdentity(spreadsheetId, sheetName, identityValue, identityColumn) {
        // Helper to convert a column letter (e.g., "A") to a 0-based index.
        const columnLetterToIndex = (letter) =>
            letter.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);

        const identityIndex = columnLetterToIndex(identityColumn);

        // Step 1: Retrieve all rows from the sheet.
        return this.getSpreadsheetValues(spreadsheetId, sheetName)
            .then((data) => {
                const rows = data.values;
                if (!rows) {
                    throw new Error("No data found in sheet.");
                }
                let rowIndexFound = -1;
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i][identityIndex] && rows[i][identityIndex] === identityValue) {
                        rowIndexFound = i; // Zero-indexed row.
                        break;
                    }
                }
                if (rowIndexFound === -1) {
                    throw new Error(`Row with identity value "${identityValue}" not found in column ${identityColumn}`);
                }
                return rowIndexFound;
            })
            .then((rowIndexFound) => {
                // Step 2: Retrieve the sheetId for the sheet.
                return this.getSheetIdByName(spreadsheetId, sheetName)
                    .then((sheetId) => ({ rowIndexFound, sheetId }));
            })
            .then(({ rowIndexFound, sheetId }) => {
                // Step 3: Delete the row using a batchUpdate with deleteDimension.
                const accessToken = this.gapi.auth.getToken().access_token;
                const payload = {
                    requests: [
                        {
                            deleteDimension: {
                                range: {
                                    sheetId: sheetId,
                                    dimension: "ROWS",
                                    startIndex: rowIndexFound,
                                    endIndex: rowIndexFound + 1,
                                },
                            },
                        },
                    ],
                };

                return fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify(payload),
                    }
                );
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error deleting row: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                // console.log("Row deleted successfully:", data);
                return data;
            })
            .catch((error) => {
                console.error("Error deleting row by identity:", error);
                throw error;
            });
    }

    /**
     * Retrieves a row by identity using a header name for the identity column.
     *
     * This method assumes that the first row of the sheet is the header.
     *
     * @param {string} spreadsheetId - The ID of the spreadsheet.
     * @param {string} sheetName - The name of the sheet.
     * @param {any} identityValue - The unique value to search for.
     * @param {string} identityHeader - The header name where the identity is located.
     * @returns {Promise<Object>} A promise that resolves with an object containing:
     *    - headerRow: The header row as an array.
     *    - rowNumber: The 1-indexed row number where the identity was found.
     *    - rowData: The entire row data as an array.
     */
    getRowByIdentityUsingHeader(spreadsheetId, sheetName, identityValue, identityHeader) {
        return this.getSpreadsheetValues(spreadsheetId, sheetName)
            .then((data) => {
                const rows = data.values;
                if (!rows || rows.length < 2) {
                    throw new Error("No data found or missing header row.");
                }
                // Assume first row is the header.
                const headerRow = rows[0];
                const identityIndex = headerRow.indexOf(identityHeader);
                if (identityIndex === -1) {
                    throw new Error(`Header "${identityHeader}" not found.`);
                }
                // Iterate over rows starting from row 2 (index 1)
                for (let i = 1; i < rows.length; i++) {
                    if (rows[i][identityIndex] && rows[i][identityIndex] === identityValue) {
                        return {
                            headerRow,
                            rowNumber: i + 1, // Google Sheets rows are 1-indexed
                            rowData: rows[i],
                        };
                    }
                }
                throw new Error(`Row with identity value "${identityValue}" not found under header "${identityHeader}".`);
            })
            .catch((error) => {
                console.error("Error retrieving row by identity using header:", error);
                throw error;
            });
    }

    /**
     * Retrieves a spreadsheet by its name using the Drive API.
     *
     * Only returns spreadsheets that have the managedBy property set to "MyApp".
     *
     * @param {string} title - The title of the spreadsheet.
     * @returns {Promise<Object|null>} A promise that resolves with the spreadsheet file (id and name) or null if not found.
     */
    getSpreadsheetByName(title) {
        const accessToken = this.gapi.auth.getToken().access_token;
        const query = encodeURIComponent(
            // `name = '${title}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false and appProperties has { key='managedBy' and value='myApp' }`
            `name = '${title}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
        );

        return fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error fetching spreadsheet: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                if (data.files && data.files.length > 0) {
                    // console.log("Spreadsheet found:", data.files[0]);
                    return data.files[0];
                } else {
                    // console.log("Spreadsheet not found with title:", title);
                    return null;
                }
            })
            .catch((error) => {
                console.error("Error getting spreadsheet by name:", error);
                throw error;
            });
    }

    /**
     * Creates the spreadsheet file if it doesn't exist.
     *
     * Checks for a spreadsheet with the given title (that is managed by your app); 
     * if it exists, returns it, otherwise creates a new spreadsheet.
     *
     * @param {string} title - The title of the spreadsheet.
     * @returns {Promise<Object>} A promise that resolves with the existing or newly created spreadsheet data.
     */
    createSpreadsheetIfNotExists(title) {
        return this.getSpreadsheetByName(title)
            .then((file) => {
                // console.log({ file })
                if (file) {
                    // Spreadsheet exists – return it.
                    return file;
                } else if (file === null) {
                    // Spreadsheet doesn't exist – create a new one.
                    return this.createSpreadsheet(title);
                }
            })
            .catch((error) => {
                console.error("Error ensuring spreadsheet exists:", error);
                throw error;
            });
    }

    /**
 * Retrieves a spreadsheet by its ID using the Sheets API.
 *
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @returns {Promise<Object>} A promise that resolves with the spreadsheet data.
 */
    getSpreadsheetById(spreadsheetId) {
        const accessToken = this.gapi.auth.getToken().access_token;
        return fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error fetching spreadsheet by ID: " + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                // console.log("Spreadsheet retrieved:", data);
                return data;
            })
            .catch(error => {
                console.error("Error getting spreadsheet by ID:", error);
                throw error;
            });
    }

    // -------------------------------------------------------------------
    // Additional convenience methods (inspired by MongoDB/Mongoose patterns)
    // -------------------------------------------------------------------

    /**
     * Retrieves all rows from a sheet and filters them using a predicate function.
     *
     * @param {string} spreadsheetId - The ID of the spreadsheet.
     * @param {string} sheetName - The name of the sheet.
     * @param {Function} predicate - A function that receives a row (array) and returns true if the row should be included.
     * @returns {Promise<Array>} A promise that resolves with an array of matching rows.
     */
    findRows(spreadsheetId, sheetName, predicate) {
        return this.getSpreadsheetValues(spreadsheetId, sheetName)
            .then((data) => {
                const rows = data.values || [];
                return rows.filter(predicate);
            });
    }

    /**
     * Inserts a new row at the specified index (1-indexed) in a sheet.
     *
     * Uses a batchUpdate request with an insertDimension request to insert an empty row,
     * then updates that row with rowData.
     *
     * @param {string} spreadsheetId - The ID of the spreadsheet.
     * @param {string} sheetName - The name of the sheet.
     * @param {Array} rowData - An array of values representing the row.
     * @param {number} rowIndex - The 1-indexed row number where the row should be inserted.
     * @returns {Promise<Object>} A promise that resolves with the update response.
     */
    insertRowAtIndex(spreadsheetId, sheetName, rowData, rowIndex) {
        const accessToken = this.gapi.auth.getToken().access_token;
        return this.getSheetIdByName(spreadsheetId, sheetName)
            .then((sheetId) => {
                const payload = {
                    requests: [
                        {
                            insertDimension: {
                                range: {
                                    sheetId: sheetId,
                                    dimension: "ROWS",
                                    // startIndex: rowIndex - 1,
                                    startIndex: rowIndex,
                                    endIndex: rowIndex,
                                },
                                inheritFromBefore: true,
                            },
                        },
                    ],
                };

                return fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify(payload),
                    }
                );
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error inserting row: " + response.statusText);
                }
                return response.json();
            })
            .then(() => {
                // Now update the newly inserted row with rowData.
                const lastColumnLetter = String.fromCharCode("A".charCodeAt(0) + rowData.length - 1);
                const range = `${sheetName}!A${rowIndex}:${lastColumnLetter}${rowIndex}`;
                return this.updateSpreadsheetValues(spreadsheetId, range, [rowData]);
            });
    }

    /**
     * Updates an entire row at the given row index (1-indexed) with rowData.
     *
     * @param {string} spreadsheetId - The ID of the spreadsheet.
     * @param {string} sheetName - The name of the sheet.
     * @param {number} rowIndex - The 1-indexed row number to update.
     * @param {Array} rowData - An array of values representing the new row data.
     * @param {string} [valueInputOption="USER_ENTERED"] - How the input data should be interpreted.
     * @returns {Promise<Object>} A promise that resolves with the update response.
     */
    updateRowAtIndex(spreadsheetId, sheetName, rowIndex, rowData, valueInputOption = "USER_ENTERED") {
        const lastColumnLetter = String.fromCharCode("A".charCodeAt(0) + rowData.length - 1);
        const range = `${sheetName}!A${rowIndex}:${lastColumnLetter}${rowIndex}`;
        return this.updateSpreadsheetValues(spreadsheetId, range, [rowData], valueInputOption);
    }

    /**
     * Deletes a row at the specified row index (1-indexed) in a sheet.
     *
     * @param {string} spreadsheetId - The ID of the spreadsheet.
     * @param {string} sheetName - The name of the sheet.
     * @param {number} rowIndex - The 1-indexed row number to delete.
     * @returns {Promise<Object>} A promise that resolves with the deletion response.
     */
    deleteRowAtIndex(spreadsheetId, sheetName, rowIndex) {
        return this.getSheetIdByName(spreadsheetId, sheetName)
            .then((sheetId) => {
                const accessToken = this.gapi.auth.getToken().access_token;
                const payload = {
                    requests: [
                        {
                            deleteDimension: {
                                range: {
                                    sheetId: sheetId,
                                    dimension: "ROWS",
                                    startIndex: rowIndex,
                                    endIndex: rowIndex + 1,
                                },
                            },
                        },
                    ],
                };

                return fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify(payload),
                    }
                );
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error deleting row: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                // console.log("Row deleted successfully:", data);
                return data;
            });
    }

    async deleteRowAtIndexByName(spreadsheetName, sheetName, rowIndex) {
        const spreadsheet = await this.getSpreadsheetByName(spreadsheetName);
        if (!spreadsheet) {
            throw new Error(`Spreadsheet with name "${spreadsheetName}" not found.`);
        }
        const spreadsheetId = spreadsheet.spreadsheetId || spreadsheet.id;
        return this.deleteRowAtIndex(spreadsheetId, sheetName, rowIndex);
    }

    /**
 * Deletes all rows whose “id” cell matches one of the IDs in idsToDelete.
 * @param {string} spreadsheetName  the name of the spreadsheet
 * @param {string} sheetName        the name of the tab
 * @param {number[]} idsToDelete    array of numeric IDs to delete
 */
    async deleteRowsByIdList(spreadsheetName, sheetName, idsToDelete) {
        // 1) find your spreadsheet and sheetId
        const spreadsheet = await this.getSpreadsheetByName(spreadsheetName);
        if (!spreadsheet) throw new Error(`Spreadsheet "${spreadsheetName}" not found.`);
        const spreadsheetId = spreadsheet.spreadsheetId || spreadsheet.id;
        const sheetId = await this.getSheetIdByName(spreadsheetId, sheetName);
        console.log("deleteRowsByIdList row number 785 works!")

        // 2) pull down the entire sheet (or at least the column containing your IDs)
        const accessToken = this.gapi.auth.getToken().access_token;
        console.log("deleteRowsByIdList row number 789 works!")
        const range = `${sheetName}!A:Z`;          // adjust so only the columns you need
        const res = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        if (!res.ok) throw new Error(`Error fetching sheet values: ${res.statusText}`);
        const { values } = await res.json();
        console.log("deleteRowsByIdList row number 799 works!")

        // 3) assume your "id" lives in a known column—find its index
        const headerRow = values[0];
        const idColIndex = headerRow.indexOf('id');
        console.log({headerRow});
        if (idColIndex === -1) throw new Error(`No "id" column in sheet "${sheetName}".`);

        // 4) map IDs to their rowIndexes (zero-based in the sheet data excl header)
        const rowIndexes = values
            .map((row, idx) => ({ idx, id: Number(row[idColIndex]) }))
            .filter(r => idsToDelete.includes(r.id))
            .map(r => r.idx - 1)    // convert from values[] index to zero-based sheet ROW index (minus header)
            .filter(i => i >= 0);

        if (rowIndexes.length === 0) {
            console.warn('No matching IDs found; nothing to delete.');
            return;
        }
        console.log("deleteRowsByIdList row number 818 works!")

        // 5) sort descending so deletions don't shift subsequent indexes
        rowIndexes.sort((a, b) => b - a);

        // 6) build one batchUpdate with all deleteDimension requests
        const requests = rowIndexes.map(rowIndex => ({
            deleteDimension: {
                range: {
                    sheetId,
                    dimension: 'ROWS',
                    startIndex: rowIndex,
                    endIndex: rowIndex + 1
                }
            }
        }));

        // 7) fire the batchUpdate
        const batchRes = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({ requests })
            }
        );
        if (!batchRes.ok) {
            throw new Error(`Error deleting rows: ${batchRes.statusText}`);
        }
        const result = await batchRes.json();
        console.log(`Deleted ${rowIndexes.length} rows`, result);
        return result;
    }


    /**
 * Deletes all rows in a sheet.
 *
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @param {string} sheetName - The name of the sheet.
 * @param {Array} range - an array of values representing the range of the rows.
 * @returns {Promise<Object>} A promise that resolves with the deletion response.
 */
    deleteAllRows(spreadsheetId, sheetName, range) {
        return this.getSheetIdByName(spreadsheetId, sheetName)
            .then((sheetId) => {
                const accessToken = this.gapi.auth.getToken().access_token;
                const payload = {
                    requests: [
                        {
                            deleteDimension: {
                                range: {
                                    sheetId: sheetId,
                                    dimension: "ROWS",
                                    startIndex: range[0],
                                    endIndex: range[1] + 1,
                                },
                            },
                        },
                    ],
                };

                return fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify(payload),
                    }
                );
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error deleting row: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                // console.log("Row deleted successfully:", data);
                return data;
            });
    }

    async deleteAllRowsByName(spreadsheetName, sheetName, range) {
        const spreadsheet = await this.getSpreadsheetByName(spreadsheetName);
        if (!spreadsheet) {
            throw new Error(`Spreadsheet with name "${spreadsheetName}" not found.`);
        }
        const spreadsheetId = spreadsheet.spreadsheetId || spreadsheet.id;
        return this.deleteAllRows(spreadsheetId, sheetName, range);
    }

    /**
     * Appends a new row to the end of the specified sheet.
     *
     * @param {string} spreadsheetId - The ID of the spreadsheet.
     * @param {string} sheetName - The name of the sheet.
     * @param {Array} rowData - An array of values representing the new row.
     * @param {string} [valueInputOption="USER_ENTERED"] - How the input data should be interpreted.
     * @returns {Promise<Object>} A promise that resolves with the append response.
     */
    appendRow(spreadsheetId, sheetName, rowData, valueInputOption = "USER_ENTERED") {
        // if (Array.isArray(rowData)) {
        //     return this.appendSpreadsheetValues(spreadsheetId, sheetName, rowData, valueInputOption);
        // }
        console.log({ rowData: [...rowData] });
        return this.appendSpreadsheetValues(spreadsheetId, sheetName, [...rowData], valueInputOption);
    }

    /**
 * Creates a spreadsheet (if it doesn't exist) and for each provided schema:
 * - Ensures the sheet with sheetName exists (creates it if needed)
 * - Sets the header row using the shape array.
 *
 * @param {string} title - The title of the spreadsheet.
 * @param {Array<Object>} schemas - An array of schemas. Each schema should be an object:
 *    { sheetName: string, shape: Array<string> }
 * @returns {Promise<Object>} A promise that resolves with the spreadsheet data.
 */
    async createSpreadsheetWithSheetsAndHeaders(title, schemas) {
        try {
            // Create or get the spreadsheet.
            const spreadsheet = await this.createSpreadsheetIfNotExists(title);
            // Depending on your createSpreadsheet method, the ID may be in spreadsheet.spreadsheetId or spreadsheet.id.
            const spreadsheetId = spreadsheet.spreadsheetId || spreadsheet.id;

            // Process each schema.
            for (const schema of schemas) {
                let sheetExists = false;
                try {
                    // Try to retrieve the sheet ID (will throw an error if not found).
                    await this.getSheetIdByName(spreadsheetId, schema.sheetName);
                    sheetExists = true;
                    // console.log(`Sheet "${schema.sheetName}" already exists.`);
                } catch (error) {
                    // If not found, we'll create the sheet.
                    sheetExists = false;
                    console.log(`Sheet "${schema.sheetName}" does not exist. Creating it...`);
                }

                if (!sheetExists) {
                    await this.createSheetPage(spreadsheetId, schema.sheetName);
                }

                // Now set the header section with the provided shape array.
                await this.setHeaderSection(spreadsheetId, schema.sheetName, schema.shape);
            }

            return spreadsheet;
        } catch (error) {
            console.error("Error creating spreadsheet with sheets and headers:", error);
            throw error;
        }
    }


    /**
 * Updates the headers for multiple sheets in the specified spreadsheet.
 *
 * Expects an array of schemas, where each schema is an object:
 * { sheetName: string, shape: Array<string> }
 *
 * For each schema, it updates the first row (header) of the specified sheet
 * with the provided shape.
 *
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @param {Array<Object>} schemas - An array of schema objects.
 * @returns {Promise<Object>} A promise that resolves when all header updates are complete.
 */
    async updateHeaders(spreadsheetId, schemas) {
        try {
            for (const schema of schemas) {
                try {
                    // Check if the sheet exists. If not, getSheetIdByName will throw an error.
                    await this.getSheetIdByName(spreadsheetId, schema.sheetName);
                    // If exists, update the header (first row) with the shape array.
                    await this.setHeaderSection(spreadsheetId, schema.sheetName, schema.shape);
                    // console.log(`Updated header for "${schema.sheetName}" with: ${schema.shape}`);
                } catch (error) {
                    console.error(`Error updating header for "${schema.sheetName}": ${error.message}`);
                    // Optionally, you could create the sheet here if it doesn't exist.
                }
            }
            return { success: true };
        } catch (error) {
            console.error("Error updating headers for sheets:", error);
            throw error;
        }
    }


    /**
 * Updates the headers for multiple sheets in the specified spreadsheet.
 *
 * Expects an array of schemas, where each schema is an object:
 * { sheetName: string, shape: Array<string> }
 *
 * This method uses the spreadsheet name instead of the spreadsheet ID.
 * It retrieves the spreadsheet by its name and then updates the header (first row)
 * of each specified sheet with the provided shape.
 *
 * @param {string} spreadsheetName - The name of the spreadsheet.
 * @param {Array<Object>} schemas - An array of schema objects.
 * @returns {Promise<Object>} A promise that resolves when all header updates are complete.
 */
    async updateHeadersByName(spreadsheetName, schemas) {
        try {
            // Retrieve the spreadsheet using its name.
            const spreadsheetFile = await this.getSpreadsheetByName(spreadsheetName);
            if (!spreadsheetFile) {
                throw new Error(`Spreadsheet with name "${spreadsheetName}" not found.`);
            }
            // Use the appropriate property from the retrieved file.
            const spreadsheetId = spreadsheetFile.spreadsheetId || spreadsheetFile.id;

            // Iterate over each schema and update its header.
            for (const schema of schemas) {
                try {
                    // Ensure the sheet exists.
                    await this.getSheetIdByName(spreadsheetId, schema.sheetName);
                    // Update the header (first row) with the shape array.
                    await this.setHeaderSection(spreadsheetId, schema.sheetName, schema.shape);
                    // console.log(`Updated header for "${schema.sheetName}" with: ${schema.shape}`);
                } catch (error) {
                    console.error(`Error updating header for "${schema.sheetName}": ${error.message}`);
                    // Optionally, you could decide to create the sheet if it doesn't exist.
                }
            }
            return { success: true };
        } catch (error) {
            console.error("Error updating headers for sheets by name:", error);
            throw error;
        }
    }

    /**
 * Posts the current settings data to the "Settings" sheet.
 *
 * This method retrieves the spreadsheet by its name, then appends a new row to the "Settings"
 * sheet using the following schema:
 * ["address", "autoPost", "repostingRules", "aiConfigurations", "visualCustomization", "notifications"]
 *
 * @param {string} spreadsheetName - The name of the spreadsheet.
 * @param {Object} data - The settings data (from your store) to post.
 * @param {Array<String>} schema - The settings data (from your store) to post.
 * @returns {Promise<Object>} A promise that resolves with the response from appending the row.
 */
    async postOneRowPage(spreadsheetName, data, schema, rowIndex, schemaName = "Settings") {
        try {
            // Retrieve the spreadsheet by name.
            const spreadsheet = await this.getSpreadsheetByName(spreadsheetName);
            if (!spreadsheet) {
                throw new Error(`Spreadsheet with name "${spreadsheetName}" not found.`);
            }
            const spreadsheetId = spreadsheet.spreadsheetId || spreadsheet.id;

            // Convert the data object into an array based on the schema order.
            const rowData = schema.map(key => {
                let value = data[key];
                // If the value is an object, you can store it as a JSON string.
                if (value && typeof value === "object") {
                    return JSON.stringify(value);
                }
                return value;
            });

            // Append the row to the "Settings" sheet.
            // Assume you have defined appendRow which wraps appendSpreadsheetValues.
            // let response;
            // const response = await this.updateRowAtIndex(spreadsheetId, "Settings", rowData, rowIndex);
            // if(!response){
            // }
            const response2 = await this.insertRowAtIndex(spreadsheetId, schemaName, rowData, rowIndex);
            // console.log("Settings row appended:", response2);
            return response2;
            // console.log("Settings row appended:", response);
            // return response;
        } catch (error) {
            console.error("Error posting settings page:", error);
            throw error;
        }
    }

    /**
* Posts the current settings data to the "Settings" sheet.
*
* This method retrieves the spreadsheet by its name, then appends a new row to the "Settings"
* sheet using the following schema:
* ["address", "autoPost", "repostingRules", "aiConfigurations", "visualCustomization", "notifications"]
*
* @param {String} spreadsheetName - The name of the spreadsheet.
* @param {String} sheetName - The name of the sheet inside of the spreadsheet.
* @param {Array<String>} schema - The settings data (from your store) to post.
* @param {Object} data - The data to post.
* @param {String | Number} - The row index in the sheet 
* @returns {Promise<Object>} A promise that resolves with the response from appending the row.
*/
    async updateRowByRowId(spreadsheetName, sheetName, schema, data, rowIndex) {
        try {
            // Retrieve the spreadsheet by name.
            const spreadsheet = await this.getSpreadsheetByName(spreadsheetName);
            if (!spreadsheet) {
                throw new Error(`Spreadsheet with name "${spreadsheetName}" not found.`);
            }
            const spreadsheetId = spreadsheet.spreadsheetId || spreadsheet.id;

            // Convert the data object into an array based on the schema order.
            const rowData = schema.map(key => {
                let value = data[key];
                // If the value is an object, you can store it as a JSON string.
                if (value && typeof value === "object") {
                    return JSON.stringify(value);
                }
                return value;
            });

            // Append the row to the "Settings" sheet.
            // Assume you have defined appendRow which wraps appendSpreadsheetValues.
            // let response;
            // const response = await this.updateRowAtIndex(spreadsheetId, "Settings", rowData, rowIndex);
            // if(!response){
            // }
            const response2 = await this.insertRowAtIndex(spreadsheetId, sheetName, rowData, rowIndex);
            // console.log("Settings row appended:", response2);
            return response2;
            // console.log("Settings row appended:", response);
            // return response;
        } catch (error) {
            console.error("Error posting settings page:", error);
            throw error;
        }
    }


    /**
 * Posts the current settings data to the "Settings" sheet.
 *
 * This method retrieves the spreadsheet by its name, then appends a new row to the "Settings"
 * sheet using the following schema:
 * ["address", "autoPost", "repostingRules", "aiConfigurations", "visualCustomization", "notifications"]
 *
 * @param {string} spreadsheetName - The name of the spreadsheet.
 * @param {Object} data - The settings data (from your store) to post.
 * @param {Array<String>} schema - The settings data (from your store) to post.
 * @returns {Promise<Object>} A promise that resolves with the response from appending the row.
 */
    async appendRowInPage(spreadsheetName, sheetName, data, schema) {
        try {
            console.log("line 1088 just below try keyword", spreadsheetName);
            // Retrieve the spreadsheet by name.
            const spreadsheet = await this.getSpreadsheetByName(spreadsheetName);
            console.log("line 1090", { spreadsheet });
            if (!spreadsheet) {
                throw new Error(`Spreadsheet with name "${spreadsheetName}" not found.`);
            }
            console.log("line 1092", { spreadsheet });
            const spreadsheetId = spreadsheet.spreadsheetId || spreadsheet.id;

            if (Array.isArray(data)) {
                console.log("line 1098", { spreadsheet });
                const finalRowData = [];
                for (let i = 0; i < data.length; i++) {
                    let val = data[i];
                    console.log("line 1102", { val });
                    const rowData = schema.map(key => {
                        let value = val[key];
                        if (value && typeof value === "object") {
                            return JSON.stringify(value);
                        }
                        console.log("line 1105", { value });
                        return value;
                    })
                    console.log("line 1111", { rowData });
                    finalRowData.push(rowData);
                }
                console.log("line 1110", { finalRowData });
                const response = await this.appendRow(spreadsheetId, sheetName, finalRowData);
                console.log("line 1115", { response });
                // console.log(`${sheetName} row appended:`, response);
                return response;
            }

            // Convert the data object into an array based on the schema order.
            const rowData = schema.map(key => {
                let value = data[key];
                console.log("line 1124", { value });
                // If the value is an object, you can store it as a JSON string.
                if (value && typeof value === "object") {
                    return JSON.stringify(value);
                }
                return value;
            });
            console.log("line 1128", { rowData });

            // Append the row to the "Settings" sheet.
            // Assume you have defined appendRow which wraps appendSpreadsheetValues.
            const response = await this.appendRow(spreadsheetId, sheetName, [rowData]);
            console.log("line 1132", { response });
            // console.log(`${sheetName} row appended:`, response);
            return response;
        } catch (error) {
            console.error(`Error posting ${sheetName} page:`, error);
            throw error;
        }
    }


    /**
 * Retrieves the settings from the "Settings" sheet of a spreadsheet.
 *
 * It expects the "Settings" sheet to have a header row (row 1) and the settings data
 * in the next row (row 2). It returns an object mapping header keys to their corresponding values.
 * If a cell value appears to be JSON (starts with "{" or "["), it will attempt to parse it.
 *
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @returns {Promise<Object>} A promise that resolves with the settings object.
 */
    async getSettingsFromSpreadsheet(spreadsheetId) {
        try {
            // Retrieve all data from the "Settings" sheet.
            const data = await this.getSpreadsheetValues(spreadsheetId, "Settings");
            const rows = data.values;

            if (!rows || rows.length < 2) {
                throw new Error("No settings data found. Ensure the 'Settings' sheet has a header and at least one data row.");
            }

            // Assume the first row is the header and the second row is the settings data.
            const header = rows[0];
            const settingsRow = rows[1];
            const settings = {};

            header.forEach((key, index) => {
                let value = settingsRow[index] !== undefined ? settingsRow[index] : null;
                if (typeof value === "string" && (value.trim().startsWith("{") || value.trim().startsWith("["))) {
                    try {
                        value = JSON.parse(value);
                    } catch (e) {
                        console.warn(`Failed to parse JSON for key "${key}":`, e);
                    }
                }
                settings[key] = value;
            });

            // console.log("Retrieved settings:", settings);
            return settings;
        } catch (error) {
            console.error("Error getting settings from spreadsheet:", error);
            throw error;
        }
    }


    /**
 * Retrieves the settings from the "Settings" sheet of a spreadsheet.
 *
 * It expects the "Settings" sheet to have a header row (row 1) and the settings data
 * in the next row (row 2). It returns an object mapping header keys to their corresponding values.
 * If a cell value appears to be JSON (starts with "{" or "["), it will attempt to parse it.
 *
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @returns {Promise<Object>} A promise that resolves with the settings object.
 */

    async getSettingsFronSpreadsheetByName(spreadsheetName) {
        try {
            const spreadsheet = await this.getSpreadsheetByName(spreadsheetName);
            if (!spreadsheet) {
                throw new Error(`Spreadsheet with name "${spreadsheetName}" not found.`)
            }
            const spreadsheetId = spreadsheet.spreadsheetId || spreadsheet.id;
            return this.getSettingsFromSpreadsheet(spreadsheetId);
        } catch (error) {
            console.error("Error getting settings from spreadsheet:", error);
            throw error;
        }
    }

    /**
 * Retrieves all rows from a sheet and filters them using a predicate function.
 *
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @param {string} sheetName - The name of the sheet.
 * @param {Function} predicate - A function that receives a row (array) and returns true if the row should be included.
 * @returns {Promise<Array>} A promise that resolves with an array of matching rows.
 */
    findRows(spreadsheetId, sheetName, predicate) {
        return this.getSpreadsheetValues(spreadsheetId, sheetName)
            .then((data) => {
                const rows = data.values || [];
                return rows.filter(predicate);
            });
    }

    /**
     * Inserts a new row at the specified index (1-indexed) in a sheet.
     *
     * Uses a batchUpdate request with an insertDimension request to insert an empty row,
     * then updates that row with rowData.
     *
     * @param {string} spreadsheetId - The ID of the spreadsheet.
     * @param {string} sheetName - The name of the sheet.
     * @param {Array} rowData - An array of values representing the row.
     * @param {number} rowIndex - The 1-indexed row number where the row should be inserted.
     * @returns {Promise<Object>} A promise that resolves with the update response.
     */
    insertRowAtIndex(spreadsheetId, sheetName, rowData, rowIndex) {
        const accessToken = this.gapi.auth.getToken().access_token;
        return this.getSheetIdByName(spreadsheetId, sheetName)
            .then((sheetId) => {
                const payload = {
                    requests: [
                        {
                            insertDimension: {
                                range: {
                                    sheetId: sheetId,
                                    dimension: "ROWS",
                                    // startIndex: rowIndex - 1,
                                    startIndex: rowIndex,
                                    endIndex: rowIndex,
                                },
                                inheritFromBefore: true,
                            },
                        },
                    ],
                };

                return fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify(payload),
                    }
                );
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error inserting row: " + response.statusText);
                }
                return response.json();
            })
            .then(() => {
                // Now update the newly inserted row with rowData.
                const lastColumnLetter = String.fromCharCode("A".charCodeAt(0) + rowData.length - 1);
                const range = `${sheetName}!A${rowIndex}:${lastColumnLetter}${rowIndex}`;
                return this.updateSpreadsheetValues(spreadsheetId, range, [rowData]);
            });
    }

    /**
     * Updates an entire row at the given row index (1-indexed) with rowData.
     *
     * @param {string} spreadsheetId - The ID of the spreadsheet.
     * @param {string} sheetName - The name of the sheet.
     * @param {number} rowIndex - The 1-indexed row number to update.
     * @param {Array} rowData - An array of values representing the new row data.
     * @param {string} [valueInputOption="USER_ENTERED"] - How the input data should be interpreted.
     * @returns {Promise<Object>} A promise that resolves with the update response.
     */
    updateRowAtIndex(spreadsheetId, sheetName, rowIndex, rowData, valueInputOption = "USER_ENTERED") {
        const lastColumnLetter = String.fromCharCode("A".charCodeAt(0) + rowData.length - 1);
        const range = `${sheetName}!A${rowIndex}:${lastColumnLetter}${rowIndex}`;
        return this.updateSpreadsheetValues(spreadsheetId, range, [rowData], valueInputOption);
    }

    /**
     * Deletes a row at the specified row index (1-indexed) in a sheet.
     *
     * @param {string} spreadsheetId - The ID of the spreadsheet.
     * @param {string} sheetName - The name of the sheet.
     * @param {number} rowIndex - The 1-indexed row number to delete.
     * @returns {Promise<Object>} A promise that resolves with the deletion response.
     */
    deleteRowAtIndex(spreadsheetId, sheetName, rowIndex) {
        return this.getSheetIdByName(spreadsheetId, sheetName)
            .then((sheetId) => {
                const accessToken = this.gapi.auth.getToken().access_token;
                const payload = {
                    requests: [
                        {
                            deleteDimension: {
                                range: {
                                    sheetId: sheetId,
                                    dimension: "ROWS",
                                    startIndex: rowIndex,
                                    endIndex: rowIndex + 1,
                                },
                            },
                        },
                    ],
                };

                return fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify(payload),
                    }
                );
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error deleting row: " + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                // console.log("Row deleted successfully:", data);
                return data;
            });
    }

    async deleteRowAtIndexByName(spreadsheetName, sheetName, rowIndex) {
        const spreadsheet = await this.getSpreadsheetByName(spreadsheetName);
        if (!spreadsheet) {
            throw new Error(`Spreadsheet with name "${spreadsheetName}" not found.`);
        }
        const spreadsheetId = spreadsheet.spreadsheetId || spreadsheet.id;
        return this.deleteRowAtIndex(spreadsheetId, sheetName, rowIndex);
    }

    /**
     * Appends a new row to the end of the specified sheet.
     *
     * @param {string} spreadsheetId - The ID of the spreadsheet.
     * @param {string} sheetName - The name of the sheet.
     * @param {Array} rowData - An array of values representing the new row.
     * @param {string} [valueInputOption="USER_ENTERED"] - How the input data should be interpreted.
     * @returns {Promise<Object>} A promise that resolves with the append response.
     */
    // appendRow(spreadsheetId, sheetName, rowData, valueInputOption = "USER_ENTERED") {
    //     return this.appendSpreadsheetValues(spreadsheetId, sheetName, [rowData], valueInputOption);
    // }

    /**
 * Creates a spreadsheet (if it doesn't exist) and for each provided schema:
 * - Ensures the sheet with sheetName exists (creates it if needed)
 * - Sets the header row using the shape array.
 *
 * @param {string} title - The title of the spreadsheet.
 * @param {Array<Object>} schemas - An array of schemas. Each schema should be an object:
 *    { sheetName: string, shape: Array<string> }
 * @returns {Promise<Object>} A promise that resolves with the spreadsheet data.
 */
    async createSpreadsheetWithSheetsAndHeaders(title, schemas) {
        try {
            // Create or get the spreadsheet.
            const spreadsheet = await this.createSpreadsheetIfNotExists(title);
            // Depending on your createSpreadsheet method, the ID may be in spreadsheet.spreadsheetId or spreadsheet.id.
            const spreadsheetId = spreadsheet.spreadsheetId || spreadsheet.id;

            // Process each schema.
            for (const schema of schemas) {
                let sheetExists = false;
                try {
                    // Try to retrieve the sheet ID (will throw an error if not found).
                    await this.getSheetIdByName(spreadsheetId, schema.sheetName);
                    sheetExists = true;
                    // console.log(`Sheet "${schema.sheetName}" already exists.`);
                } catch (error) {
                    // If not found, we'll create the sheet.
                    sheetExists = false;
                    // console.log(`Sheet "${schema.sheetName}" does not exist. Creating it...`);
                }

                if (!sheetExists) {
                    await this.createSheetPage(spreadsheetId, schema.sheetName);
                }

                // Now set the header section with the provided shape array.
                await this.setHeaderSection(spreadsheetId, schema.sheetName, schema.shape);
            }

            return spreadsheet;
        } catch (error) {
            console.error("Error creating spreadsheet with sheets and headers:", error);
            throw error;
        }
    }


    /**
 * Updates the headers for multiple sheets in the specified spreadsheet.
 *
 * Expects an array of schemas, where each schema is an object:
 * { sheetName: string, shape: Array<string> }
 *
 * For each schema, it updates the first row (header) of the specified sheet
 * with the provided shape.
 *
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @param {Array<Object>} schemas - An array of schema objects.
 * @returns {Promise<Object>} A promise that resolves when all header updates are complete.
 */
    async updateHeaders(spreadsheetId, schemas) {
        try {
            for (const schema of schemas) {
                try {
                    // Check if the sheet exists. If not, getSheetIdByName will throw an error.
                    await this.getSheetIdByName(spreadsheetId, schema.sheetName);
                    // If exists, update the header (first row) with the shape array.
                    await this.setHeaderSection(spreadsheetId, schema.sheetName, schema.shape);
                    // console.log(`Updated header for "${schema.sheetName}" with: ${schema.shape}`);
                } catch (error) {
                    console.error(`Error updating header for "${schema.sheetName}": ${error.message}`);
                    // Optionally, you could create the sheet here if it doesn't exist.
                }
            }
            return { success: true };
        } catch (error) {
            console.error("Error updating headers for sheets:", error);
            throw error;
        }
    }


    /**
 * Updates the headers for multiple sheets in the specified spreadsheet.
 *
 * Expects an array of schemas, where each schema is an object:
 * { sheetName: string, shape: Array<string> }
 *
 * This method uses the spreadsheet name instead of the spreadsheet ID.
 * It retrieves the spreadsheet by its name and then updates the header (first row)
 * of each specified sheet with the provided shape.
 *
 * @param {string} spreadsheetName - The name of the spreadsheet.
 * @param {Array<Object>} schemas - An array of schema objects.
 * @returns {Promise<Object>} A promise that resolves when all header updates are complete.
 */
    async updateHeadersByName(spreadsheetName, schemas) {
        try {
            // Retrieve the spreadsheet using its name.
            const spreadsheetFile = await this.getSpreadsheetByName(spreadsheetName);
            if (!spreadsheetFile) {
                throw new Error(`Spreadsheet with name "${spreadsheetName}" not found.`);
            }
            // Use the appropriate property from the retrieved file.
            const spreadsheetId = spreadsheetFile.spreadsheetId || spreadsheetFile.id;

            // Iterate over each schema and update its header.
            for (const schema of schemas) {
                try {
                    // Ensure the sheet exists.
                    await this.getSheetIdByName(spreadsheetId, schema.sheetName);
                    // Update the header (first row) with the shape array.
                    await this.setHeaderSection(spreadsheetId, schema.sheetName, schema.shape);
                    // console.log(`Updated header for "${schema.sheetName}" with: ${schema.shape}`);
                } catch (error) {
                    console.error(`Error updating header for "${schema.sheetName}": ${error.message}`);
                    // Optionally, you could decide to create the sheet if it doesn't exist.
                }
            }
            return { success: true };
        } catch (error) {
            console.error("Error updating headers for sheets by name:", error);
            throw error;
        }
    }

    /**
 * Posts the current settings data to the "Settings" sheet.
 *
 * This method retrieves the spreadsheet by its name, then appends a new row to the "Settings"
 * sheet using the following schema:
 * ["address", "autoPost", "repostingRules", "aiConfigurations", "visualCustomization", "notifications"]
 *
 * @param {string} spreadsheetName - The name of the spreadsheet.
 * @param {Object} data - The settings data (from your store) to post.
 * @param {Array<String>} schema - The settings data (from your store) to post.
 * @returns {Promise<Object>} A promise that resolves with the response from appending the row.
 */
    async postOneRowPage(spreadsheetName, data, schema, rowIndex) {
        try {
            // Retrieve the spreadsheet by name.
            const spreadsheet = await this.getSpreadsheetByName(spreadsheetName);
            if (!spreadsheet) {
                throw new Error(`Spreadsheet with name "${spreadsheetName}" not found.`);
            }
            const spreadsheetId = spreadsheet.spreadsheetId || spreadsheet.id;

            // Convert the data object into an array based on the schema order.
            const rowData = schema.map(key => {
                let value = data[key];
                // If the value is an object, you can store it as a JSON string.
                if (value && typeof value === "object") {
                    return JSON.stringify(value);
                }
                return value;
            });

            // Append the row to the "Settings" sheet.
            // Assume you have defined appendRow which wraps appendSpreadsheetValues.
            // let response;
            // const response = await this.updateRowAtIndex(spreadsheetId, "Settings", rowData, rowIndex);
            // if(!response){
            // }
            const response2 = await this.insertRowAtIndex(spreadsheetId, "Settings", rowData, rowIndex);
            // console.log("Settings row appended:", response2);
            return response2;
            // console.log("Settings row appended:", response);
            // return response;
        } catch (error) {
            console.error("Error posting settings page:", error);
            throw error;
        }
    }


    /**
 * Posts the current settings data to the "Settings" sheet.
 *
 * This method retrieves the spreadsheet by its name, then appends a new row to the "Settings"
 * sheet using the following schema:
 * ["address", "autoPost", "repostingRules", "aiConfigurations", "visualCustomization", "notifications"]
 *
 * @param {string} spreadsheetName - The name of the spreadsheet.
 * @param {Object} data - The settings data (from your store) to post.
 * @param {Array<String>} schema - The settings data (from your store) to post.
 * @returns {Promise<Object>} A promise that resolves with the response from appending the row.
 */
    // async appendRowInPage(spreadsheetName, sheetName, data, schema) {
    //     try {
    //         // Retrieve the spreadsheet by name.
    //         const spreadsheet = await this.getSpreadsheetByName(spreadsheetName);
    //         if (!spreadsheet) {
    //             throw new Error(`Spreadsheet with name "${spreadsheetName}" not found.`);
    //         }
    //         const spreadsheetId = spreadsheet.spreadsheetId || spreadsheet.id;

    //         // Convert the data object into an array based on the schema order.
    //         const rowData = schema.map(key => {
    //             let value = data[key];
    //             // If the value is an object, you can store it as a JSON string.
    //             if (value && typeof value === "object") {
    //                 return JSON.stringify(value);
    //             }
    //             return value;
    //         });

    //         // Append the row to the "Settings" sheet.
    //         // Assume you have defined appendRow which wraps appendSpreadsheetValues.
    //         const response = await this.appendRow(spreadsheetId, sheetName, rowData);
    //         // console.log(`${sheetName} row appended:`, response);
    //         return response;
    //     } catch (error) {
    //         console.error(`Error posting ${sheetName} page:`, error);
    //         throw error;
    //     }
    // }


    /**
 * Retrieves the settings from the "Settings" sheet of a spreadsheet.
 *
 * It expects the "Settings" sheet to have a header row (row 1) and the settings data
 * in the next row (row 2). It returns an object mapping header keys to their corresponding values.
 * If a cell value appears to be JSON (starts with "{" or "["), it will attempt to parse it.
 *
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @returns {Promise<Object>} A promise that resolves with the settings object.
 */
    async getSettingsFromSpreadsheet(spreadsheetId) {
        try {
            // Retrieve all data from the "Settings" sheet.
            const data = await this.getSpreadsheetValues(spreadsheetId, "Settings");
            const rows = data.values;

            if (!rows || rows.length < 2) {
                throw new Error("No settings data found. Ensure the 'Settings' sheet has a header and at least one data row.");
            }

            // Assume the first row is the header and the second row is the settings data.
            const header = rows[0];
            const settingsRow = rows[1];
            const settings = {};

            header.forEach((key, index) => {
                let value = settingsRow[index] !== undefined ? settingsRow[index] : null;
                if (typeof value === "string" && (value.trim().startsWith("{") || value.trim().startsWith("["))) {
                    try {
                        value = JSON.parse(value);
                    } catch (e) {
                        console.warn(`Failed to parse JSON for key "${key}":`, e);
                    }
                }
                settings[key] = value;
            });

            // console.log("Retrieved settings:", settings);
            return settings;
        } catch (error) {
            console.error("Error getting settings from spreadsheet:", error);
            throw error;
        }
    }


    /**
 * Retrieves the settings from the "Settings" sheet of a spreadsheet.
 *
 * It expects the "Settings" sheet to have a header row (row 1) and the settings data
 * in the next row (row 2). It returns an object mapping header keys to their corresponding values.
 * If a cell value appears to be JSON (starts with "{" or "["), it will attempt to parse it.
 *
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @returns {Promise<Object>} A promise that resolves with the settings object.
 */

    async getSettingsFronSpreadsheetByName(spreadsheetName) {
        try {
            const spreadsheet = await this.getSpreadsheetByName(spreadsheetName);
            if (!spreadsheet) {
                throw new Error(`Spreadsheet with name "${spreadsheetName}" not found.`)
            }
            const spreadsheetId = spreadsheet.spreadsheetId || spreadsheet.id;
            return this.getSettingsFromSpreadsheet(spreadsheetId);
        } catch (error) {
            console.error("Error getting settings from spreadsheet:", error);
            throw error;
        }
    }

    /**
 * Retrieves a single row from a sheet based on the row number (1-indexed).
 *
 * @param {string} spreadsheetId - The ID of the spreadsheet.
 * @param {string} sheetName - The name of the sheet.
 * @param {number} rowIndex - The 1-indexed row number to retrieve.
 * @returns {Promise<Array>} A promise that resolves with the row data as an array.
 */
    async getRowByIndex(spreadsheetId, sheetName, rowIndex) {
        try {
            // Construct the range to fetch a single row (1-indexed)
            const range = `${sheetName}!${rowIndex}:${rowIndex}`;
            const data = await this.getSpreadsheetValues(spreadsheetId, range);
            if (!data.values || data.values.length === 0) {
                console.log(`Error Row ${rowIndex} not found in sheet ${sheetName}`);
                return null;
            }
            const headers = schemas.find((schema) => schema.sheetName === sheetName).shape;
            // data.values is an array of rows, but since we requested a single row, return the first element.
            data.values.unshift(headers);
            const toObjArr = await convert2dArrToObjArr(data.values);
            console.log({ toObjArr })
            if (sheetName === "Auth" || sheetName === "Passkeys") {
                return toObjArr ? toObjArr[0] : null;
            }
            const getMediaUrlsResult = await getMediaUrls(toObjArr);
            console.log({ getMediaUrlsResult: getMediaUrlsResult[0] })
            return getMediaUrlsResult[0];
        } catch (error) {
            console.error(`Error retrieving row ${rowIndex} from sheet ${sheetName}:`, error);
            throw error;
        }
    }

    async getRowByIndexByName(spreadsheetName, sheetName, rowIndex) {
        try {
            const spreadsheet = await this.getSpreadsheetByName(spreadsheetName);
            if (!spreadsheet) {
                throw new Error(`Spreadsheet with name "${spreadsheetName}" not found.`);
            }
            const spreadsheetId = spreadsheet.spreadsheetId || spreadsheet.id;
            return this.getRowByIndex(spreadsheetId, sheetName, rowIndex);
        } catch (e) {
            console.log(`Error retrieving row ${rowIndex} from sheet ${sheetName}:`, e);
            throw error;
        }
    }

}

export default GoogleSheetsAPI;
