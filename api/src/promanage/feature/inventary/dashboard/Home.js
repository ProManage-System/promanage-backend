const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');

router.get('/stats', async (req, res) => {
    try {
        const [totalProducts, lowStock, salesToday, totalCategories] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM product'),            
            pool.query('SELECT COUNT(*) FROM product WHERE quantity <= min_stock'),            
            pool.query("SELECT SUM(total) FROM sale WHERE date::date = CURRENT_DATE"),
            pool.query('SELECT COUNT(*) FROM category')
        ]);

        res.json({
            totalProducts: parseInt(totalProducts.rows[0].count),
            lowStock: parseInt(lowStock.rows[0].count),
            salesToday: parseFloat(salesToday.rows[0].sum || 0),
            totalCategories: parseInt(totalCategories.rows[0].count)
        });
    } catch (error) {
        console.error("Error en stats del dashboard:", error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

router.get('/low-stock-report', async (req, res) => {
    try {
        const sql = `
            SELECT 
                p.id, 
                p.name as producto, 
                c.name as categoria, 
                p.quantity as stock,
                CASE 
                    WHEN p.quantity <= p.min_stock THEN 'Bajo'
                    ELSE 'Lleno'
                END as estado
            FROM product p
            INNER JOIN category c ON p.category_id = c.id
            WHERE p.quantity <= p.min_stock
            ORDER BY p.quantity ASC
            LIMIT 10`;

        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (error) {
        console.error("Error en reporte de stock:", error);
        res.status(500).json({ error: 'Error al obtener reporte' });
    }
});

router.get('/count', async (req, res) => {
    try {
        const sql = 'SELECT COUNT(*) AS total FROM product';
        const result = await pool.query(sql);
        
        res.json(result.rows[0]); 
    } catch (error) {
        console.error("Error al contar productos:", error);
        res.status(500).json({ error: 'Error al obtener el conteo de productos' });
    }
});

module.exports = router;