const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { UserRequest } = require('./User');

router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT u.id, u.name, u.email, u.phone, r.name as role
            FROM users u 
            INNER JOIN role r ON u.role_id = r.id
            ORDER BY u.id ASC;`;
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `
            SELECT u.id, u.name, u.email, u.phone, r.name as role
            FROM users u 
            INNER JOIN role r ON u.role_id = r.id
            WHERE u.id = $1`;
        const result = await pool.query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
});

router.post('/', async (req, res) => {
    const request = new UserRequest(req.body);

    const validation = request.validate();
    if (!validation.isValid) {
        return res.status(400).json({
            message: 'Errores de validación',
            errors: validation.errors
        });
    }

    try {
        const values = [request.name,
        request.email,
        request.phone,
        request.password,
        request.role_id];
        const sql = 'INSERT INTO users (name, email, phone, password, role_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const result = await pool.query(sql, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const request = new UserRequest(req.body);

    const validation = request.validate();
    if (!validation.isValid) {
        return res.status(400).json({
            message: 'Errores de validación',
            errors: validation.errors
        });
    }

    try {
        const values = [request.name,
        request.email,
        request.phone,
        request.password,
        request.role_id,
            id]
        const sql = 'UPDATE users SET name = $1, email = $2, phone = $3, password = $4, role_id = $5 WHERE id = $6 RETURNING *';
        const result = await pool.query(sql, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const sql = 'DELETE FROM users WHERE id = $1 RETURNING *';
        const result = await pool.query(sql, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'El usuario no existe' });
        }

        res.json({ message: 'Usuario eliminado con éxito', deleted: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'No se pudo eliminar el usuario' });
    }
});

module.exports = router;