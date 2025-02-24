import {sql} from "../config/db.js";

export const getProducts = async (req, res) => {
    try{
        const result = await sql`
            SELECT * FROM products
            ORDER BY created_at DESC
        `
        return res.status(200).json({success: true, data: result});
    }catch(e){
        return res.status(500).json({message: `Internal server error: ${e.message}`});
    }
}

export const getProduct = async (req, res) => {
    const {id} = req.params;
    try{
        const result = await sql`
            SELECT * FROM products
            WHERE id = ${id}
        `;
        return res.status(200).json({success: true, data: result[0]});
    }catch(e){
        return res.status(500).json({message: `Internal server error: ${e.message}`});
    }
}

export const updateProduct = async (req, res) => {
    const {id} = req.params;
    const {name, image, price} = req.body;
    if(!name || !image || !price || !id){
        return res.status(400).json({success: false, message: "Missing required fields"});
    }
    try{
        const result = await sql`
            UPDATE products
            SET name = ${name}, image = ${image}, price = ${price}
            WHERE id = ${id}
            RETURNING *
        `;
        return res.status(200).json({success: true, data: result[0]});
    }catch(e){
        return res.status(500).json({message: `Internal server error: ${e.message}`});
    }
}

export const deleteProduct = async (req, res) => {
    const {id} = req.params;
    try{
        const result = await sql`
            DELETE FROM products
            WHERE id = ${id}
            RETURNING *
        `;
        return res.status(200).json({success: true, data: result[0]});
    }catch(e){
        return res.status(500).json({message: `Internal server error: ${e.message}`});
    }
}

export const createProduct = async (req, res) => {
    const {name, image, price} = req.body;
    if(!name || !image || !price){
        return res.status(400).json({success: false, message: "Missing required fields"});
    }
    try{
        const result = await sql`
            INSERT INTO products (name, image, price)
            VALUES (${name}, ${image}, ${price})
            RETURNING *
        `;
        return res.status(200).json({success: true, data: result[0]});
    }catch(e){
        return res.status(500).json({message: `Internal server error: ${e.message}`});
    }
}