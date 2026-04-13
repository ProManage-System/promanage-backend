const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { SupplierRequest } = require('./Supplier');

router.get('/', async (req, res) => {
    try {
        const sql = 'SELECT * FROM supplier ORDER BY id ASC';
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM supplier WHERE id = $1';
        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el proveedor' });
    }
});

router.post('/', async (req, res) => {
    const request = new SupplierRequest(req.body);
    const validation = request.validate();

    if (!validation.isValid) {
        return res.status(400).json({ errors: validation.errors });
    }

    try {
        const sql = 'INSERT INTO supplier (name) VALUES ($1) RETURNING *';
        const result = await pool.query(sql, [request.name]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'El nombre del proveedor ya existe' });
        }
        res.status(500).json({ error: 'Error al insertar proveedor' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const request = new SupplierRequest(req.body);
    const validation = request.validate();

    if (!validation.isValid) {
        return res.status(400).json({ errors: validation.errors });
    }

    try {
        const sql = 'UPDATE supplier SET name = $1 WHERE id = $2 RETURNING *';
        const result = await pool.query(sql, [request.name, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar proveedor' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM supplier WHERE id = $1 RETURNING *';
        const result = await pool.query(sql, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'El proveedor no existe' });
        }

        res.json({ message: 'Proveedor eliminado con éxito' });
    } catch (error) {
        if (error.code === '23503') {
            return res.status(400).json({ error: 'No se puede eliminar: El proveedor tiene compras registradas.' });
        }
        res.status(500).json({ error: 'Error al eliminar proveedor' });
    }
});

module.exports = router;