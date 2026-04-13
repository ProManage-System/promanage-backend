const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { StatusRequest } = require('./Status');

router.get('/', async (req, res) => {
    try {
        const sql = 'SELECT * FROM status ORDER BY id ASC';
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener estado'});
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM status WHERE id = $1';
        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Estado no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el estado' });
    }
});

router.post('/', async (req, res) => {
    const request = new StatusRequest(req.body);

    if (!request.isValid()) {
        return res.status(400).json({ 
            error: 'Datos inválidos (mínimo 3 caracteres)' 
        });
    }

    try {
        const sql = 'INSERT INTO status (name) VALUES ($1) RETURNING *';
        const result = await pool.query(sql, [request.name]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const request = new StatusRequest(req.body);

    if (!request.isValid()) {
        return res.status(400).json({ error: 'Datos insuficientes para actualizar' });
    }

    try {
        const sql = 'UPDATE status SET name = $1 WHERE id = $2 RETURNING *';
        const result = await pool.query(sql, [request.name, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Estado no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const sql = 'DELETE FROM status WHERE id = $1 RETURNING *';
        const result = await pool.query(sql, [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'El estado no existe' });
        }

        res.json({ message: 'Estado eliminado con éxito', deleted: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'No se pudo eliminar el estado' });
    }
});

module.exports = router;