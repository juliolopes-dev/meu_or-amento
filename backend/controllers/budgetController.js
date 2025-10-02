const db = require('../config/database');

// Get all budget items
exports.getAll = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const [items] = await db.query('SELECT * FROM budget_items WHERE tenant_id = ? ORDER BY created_at DESC', [tenantId]);
        res.json(items);
    } catch (error) {
        console.error('Error fetching budget items:', error);
        res.status(500).json({ error: 'Erro ao buscar itens do orçamento' });
    }
};

// Get budget item by ID
exports.getById = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const [items] = await db.query('SELECT * FROM budget_items WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId]);
        if (items.length === 0) {
            return res.status(404).json({ error: 'Item do orçamento não encontrado' });
        }
        res.json(items[0]);
    } catch (error) {
        console.error('Error fetching budget item:', error);
        res.status(500).json({ error: 'Erro ao buscar item do orçamento' });
    }
};

// Create budget item
exports.create = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const { id, category_id, value, type } = req.body;
        await db.query('INSERT INTO budget_items (id, category_id, value, type, tenant_id) VALUES (?, ?, ?, ?, ?)', [id, category_id, value, type, tenantId]);
        res.status(201).json({ id, categoryId: category_id, value, type });
    } catch (error) {
        console.error('Error creating budget item:', error);
        res.status(500).json({ error: 'Erro ao criar item do orçamento' });
    }
};

// Update budget item
exports.update = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const { category_id, value, type } = req.body;
        const [result] = await db.query('UPDATE budget_items SET category_id = ?, value = ?, type = ? WHERE id = ? AND tenant_id = ?', [category_id, value, type, req.params.id, tenantId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item do orçamento não encontrado' });
        }
        
        res.json({ id: req.params.id, categoryId: category_id, value, type });
    } catch (error) {
        console.error('Error updating budget item:', error);
        res.status(500).json({ error: 'Erro ao atualizar item do orçamento' });
    }
};

// Delete budget item
exports.delete = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const [result] = await db.query('DELETE FROM budget_items WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item do orçamento não encontrado' });
        }
        
        res.json({ message: 'Item do orçamento excluído com sucesso' });
    } catch (error) {
        console.error('Error deleting budget item:', error);
        res.status(500).json({ error: 'Erro ao excluir item do orçamento' });
    }
};
