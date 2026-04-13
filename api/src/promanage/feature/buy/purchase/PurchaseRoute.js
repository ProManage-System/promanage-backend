const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { PurchaseRequest } = require('./Purchase');

router.get('/', async (req, res) => {
    const search = req.query.q || '';
    try {
        const sql = `
            SELECT p.id, p.date, p.lot, s.name as supplier_name
            FROM purchase p
            INNER JOIN supplier s ON p.supplier_id = s.id
            WHERE p.lot ILIKE $1 OR s.name ILIKE $1
            ORDER BY p.date DESC`;
        const result = await pool.query(sql, [`%${search}%`]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener compras' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const purchaseSql = `
            SELECT p.*, s.name as supplier_name 
            FROM purchase p 
            JOIN supplier s ON p.supplier_id = s.id 
            WHERE p.id = $1`;
        
        const detailsSql = `
            SELECT pd.*, pr.name as product_name 
            FROM purchase_details pd
            JOIN product pr ON pd.product_id = pr.id
            WHERE pd.purchase_id = $1`;

        const purchase = await pool.query(purchaseSql, [id]);
        if (purchase.rows.length === 0) return res.status(404).json({ error: 'Compra no encontrada' });

        const details = await pool.query(detailsSql, [id]);
        
        res.json({
            ...purchase.rows[0],
            items: details.rows
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener detalle de la compra' });
    }
});

router.post('/', async (req, res) => {
    const request = new PurchaseRequest(req.body);
    const validation = request.validate();

    if (!validation.isValid) {
        return res.status(400).json({ errors: validation.errors });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const purchaseSql = 'INSERT INTO purchase (supplier_id, date, lot) VALUES ($1, NOW(), $2) RETURNING id';
        const purchaseRes = await client.query(purchaseSql, [request.supplier_id, request.lot]);
        const purchaseId = purchaseRes.rows[0].id;

        for (const item of request.items) {
            const detailSql = `
                INSERT INTO purchase_details (product_id, purchase_id, quantity, cost_price) 
                VALUES ($1, $2, $3, $4)`;
            await client.query(detailSql, [item.product_id, purchaseId, item.quantity, item.cost_price]);

            const updateProductSql = `
                UPDATE product 
                SET quantity = quantity + $1, 
                    status_id = (CASE WHEN (quantity + $1) > 0 THEN 1 ELSE status_id END)
                WHERE id = $2`;
            await client.query(updateProductSql, [item.quantity, item.product_id]);
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Compra registrada con éxito', id: purchaseId });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Error en la transacción. No se guardó nada.' });
    } finally {
        client.release();
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { supplier_id, lot } = req.body;
    try {
        const sql = 'UPDATE purchase SET supplier_id = $1, lot = $2 WHERE id = $3 RETURNING *';
        const result = await pool.query(sql, [supplier_id, lot, id]);
        
        if (result.rowCount === 0) return res.status(404).json({ error: 'Compra no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar compra' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM purchase WHERE id = $1 RETURNING *';
        const result = await pool.query(sql, [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Compra no existe' });
        res.json({ message: 'Registro de compra eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'No se puede eliminar: Tiene detalles vinculados.' });
    }
});

module.exports = router;