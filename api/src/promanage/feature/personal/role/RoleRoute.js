const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { RoleRequest } = require('./Role');

router.get('/', async (req, res) => {
    const searchTerm = req.query.q || req.query.search;

    try {
        let sql;
        let values = [];

        if (searchTerm) {
            sql = 'SELECT id, name FROM role WHERE name ILIKE $1 ORDER BY id ASC';
            values = [`%${searchTerm}%`];
        } else {
            sql = 'SELECT id, name FROM role ORDER BY id ASC';
        }

        const result = await pool.query(sql, values);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener roles:", error);
        res.status(500).json({ error: 'Error al obtener roles' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT id, name FROM role WHERE id = $1';
        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el rol' });
    }
});

router.post('/', async (req, res) => {
    const roleReq = new RoleRequest(req.body);

    if (!roleReq.isValid()) {
        return res.status(400).json({ error: 'Datos inválidos (mínimo 3 caracteres)' });
    }

    try {
        const sql = 'INSERT INTO role (name) VALUES ($1) RETURNING id, name';
        const values = [roleReq.name];
        const result = await pool.query(sql, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al insertar el rol' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const roleReq = new RoleRequest(req.body);

    if (!roleReq.isValid()) {
        return res.status(400).json({ error: 'Datos insuficientes para actualizar' });
    }

    try {
        const sql = 'UPDATE role SET name = $1 WHERE id = $2 RETURNING id, name';
        const result = await pool.query(sql, [roleReq.name, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el rol' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const sql = 'DELETE FROM role WHERE id = $1 RETURNING id, name';
        const result = await pool.query(sql, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'El rol no existe' });
        }

        res.json({ message: 'Rol eliminado con éxito', deleted: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'No se pudo eliminar el rol' });
    }
});

module.exports = router;