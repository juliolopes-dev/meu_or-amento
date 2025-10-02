const db = require('../config/database');

// Get all categories
exports.getAll = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const [categories] = await db.query('SELECT * FROM categories WHERE tenant_id = ? ORDER BY name', [tenantId]);
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
};

// Get category by ID
exports.getById = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const [categories] = await db.query('SELECT * FROM categories WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId]);
        if (categories.length === 0) {
            return res.status(404).json({ error: 'Categoria não encontrada' });
        }
        res.json(categories[0]);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Erro ao buscar categoria' });
    }
};

// Create category
exports.create = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const { id, name, parent_id } = req.body;
        await db.query('INSERT INTO categories (id, name, parent_id, tenant_id) VALUES (?, ?, ?, ?)', [id, name, parent_id || null, tenantId]);
        res.status(201).json({ id, name, parentId: parent_id || null });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Erro ao criar categoria' });
    }
};

// Update category
exports.update = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const { name } = req.body;
        const [result] = await db.query('UPDATE categories SET name = ? WHERE id = ? AND tenant_id = ?', [name, req.params.id, tenantId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoria não encontrada' });
        }
        
        res.json({ id: req.params.id, name });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
};

// Delete category
exports.delete = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const [result] = await db.query('DELETE FROM categories WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoria não encontrada' });
        }
        
        res.json({ message: 'Categoria excluída com sucesso' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Erro ao excluir categoria' });
    }
};
