const express = require('express');
const router = express.Router();
const pool = require('../../.../../config/db');
const { SaleRequest } = require('./Sale');

router.get('/', async (req, res) => {
    const search = req.query.q || '';
    try {
        const sql = `
            SELECT * FROM sale 
            WHERE id::text LIKE $1 
            ORDER BY date DESC`;
        const result = await pool.query(sql, [`%${search}%`]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const saleSql = 'SELECT * FROM sale WHERE id = $1';
        const detailsSql = `
            SELECT sd.*, p.name as product_name 
            FROM sale_details sd
            JOIN product p ON sd.product_id = p.id
            WHERE sd.sale_id = $1`;

        const sale = await pool.query(saleSql, [id]);
        if (sale.rows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });

        const details = await pool.query(detailsSql, [id]);
        res.json({
            ...sale.rows[0],
            items: details.rows
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el detalle' });
    }
});

router.post('/', async (req, res) => {
    const request = new SaleRequest(req.body);
    const validation = request.validate();

    if (!validation.isValid) {
        return res.status(400).json({ errors: validation.errors });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const saleRes = await client.query('INSERT INTO sale (date, total) VALUES (NOW(), 0) RETURNING id');
        const saleId = saleRes.rows[0].id;
        let totalVenta = 0;

        for (const item of request.items) {
            const prodRes = await client.query('SELECT price_sell, quantity FROM product WHERE id = $1 FOR UPDATE', [item.product_id]);
            
            if (prodRes.rows.length === 0) throw new Error(`Producto con ID ${item.product_id} no existe.`);
            
            const product = prodRes.rows[0];
            if (product.quantity < item.quantity) {
                throw new Error(`Stock insuficiente para ${item.product_id}. Disponible: ${product.quantity}`);
            }

            const subtotal = product.price_sell * item.quantity;
            totalVenta += subtotal;

            await client.query(
                'INSERT INTO sale_details (sale_id, product_id, quantity, price_at_sale, subtotal) VALUES ($1, $2, $3, $4, $5)',
                [saleId, item.product_id, item.quantity, product.price_sell, subtotal]
            );

            await client.query(
                'UPDATE product SET quantity = quantity - $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }

        await client.query('UPDATE sale SET total = $1 WHERE id = $2', [totalVenta, saleId]);

        await client.query('COMMIT');
        res.status(201).json({ message: 'Venta realizada', saleId, total: totalVenta });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: error.message || 'Error en la venta' });
    } finally {
        client.release();
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { date } = req.body;
    try {
        const sql = 'UPDATE sale SET date = $1 WHERE id = $2 RETURNING *';
        const result = await pool.query(sql, [date, id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Venta no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM sale WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'No existe' });
        res.json({ message: 'Venta eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

module.exports = router;