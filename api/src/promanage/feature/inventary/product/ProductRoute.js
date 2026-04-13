const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { ProductRequest } = require('./Product');

router.get('/', async (req, res) => {
    const searchTerm = req.query.q || req.query.search;
    
    try {
        let sql = `
            SELECT p.*, c.name as category_name, s.name as status_name 
            FROM product p 
            INNER JOIN category c ON p.category_id = c.id 
            LEFT JOIN status s ON p.status_id = s.id`;
        
        let values = [];

        if (searchTerm) {
            sql += ` WHERE p.name ILIKE $1 OR p.barcode ILIKE $1`;
            values = [`%${searchTerm}%`];
        }

        sql += ` ORDER BY p.id ASC`;

        const result = await pool.query(sql, values);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `
            SELECT p.*, c.name as category_name, s.name as status_name 
            FROM product p 
            INNER JOIN category c ON p.category_id = c.id 
            LEFT JOIN status s ON p.status_id = s.id 
            WHERE p.id = $1`;

        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto'});
    }
});

router.post('/', async (req, res) => {
    const productReq = new ProductRequest(req.body);
    const validation = productReq.validate();

    if (!validation.isValid) {
        return res.status(400).json({ errors: validation.errors });
    }

    try {
        const sql = `
            INSERT INTO product (name, price_sell, category_id, min_stock, quantity, status_id, barcode) 
            VALUES ($1, $2, $3, $4, 0, 0, $5) RETURNING *`;
        
        const values = [
            productReq.name,
            productReq.price_sell,
            productReq.category_id,
            productReq.min_stock,
            productReq.barcode
        ];
        
        const result = await pool.query(sql, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({ error: 'Error al guardar el producto',});
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const productReq = new ProductRequest(req.body);
    const validation = productReq.validate();

    if (!validation.isValid) {
        return res.status(400).json({ errors: validation.errors });
    }

    try {
        const sql = `
            UPDATE product 
            SET name = $1, price_sell = $2, category_id = $3, min_stock = $4, barcode = $5 
            WHERE id = $6 RETURNING *`;
        
        const values = [
            productReq.name,
            productReq.price_sell,
            productReq.category_id,
            productReq.min_stock,
            productReq.barcode,
            id
        ];

        const result = await pool.query(sql, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `DELETE FROM product WHERE id = $1 RETURNING *`;
        const result = await pool.query(sql, [id]);
        
        if (result.rowCount === 0) 
            return res.status(404).json({ error: 'Producto no existe' });
            
        res.json({ message: 'Producto eliminado', deleted: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'No se puede eliminar el producto porque tiene registros asociados.' });
    }
});

module.exports = router;