const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { CategoryRequest } = require('./Category');

router.get('/', async (req, res) => {
    const searchTerm = req.query.q || req.query.search;
    
    try {
        let sql;
        let values = [];

        if (searchTerm) {
            sql = 'SELECT * FROM category WHERE name ILIKE $1 ORDER BY id ASC';
            values = [`%${searchTerm}%`];
        } else {
            sql = 'SELECT * FROM category ORDER BY id ASC';
        }

        const result = await pool.query(sql, values);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM category WHERE id = $1';
        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la categoría' });
    }
});

router.post('/', async (req, res) => {
    const categoryReq = new CategoryRequest(req.body);

    if (!categoryReq.isValid()) {
        return res.status(400).json({ error: 'Datos invalidos' });
    }

    try {
        const sql = 'INSERT INTO category (name) VALUES ($1) RETURNING *';
        const values = [categoryReq.name];
        const result = await pool.query(sql, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const categoryReq = new CategoryRequest(req.body);

    if (!categoryReq.isValid()) {
        return res.status(400).json({ error: 'Datos insuficientes para actualizar' });
    }

    try {
        const sql = 'UPDATE category SET name = $1 WHERE id = $2 RETURNING *';
        const result = await pool.query(sql, [categoryReq.name, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const sql = 'DELETE FROM category WHERE id = $1 RETURNING *';
        const result = await pool.query(sql, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'La categoría no existe' });
        }

        res.json({ message: 'Categoría eliminada con éxito', deleted: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'No se pudo eliminar la categoría' });
    }
});

module.exports = router;