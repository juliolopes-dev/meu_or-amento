const db = require('../config/database');

// Get all transactions
exports.getAll = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const [transactions] = await db.query('SELECT * FROM transactions WHERE tenant_id = ? ORDER BY date DESC, created_at DESC', [tenantId]);
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Erro ao buscar lançamentos' });
    }
};

// Get transaction by ID
exports.getById = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const [transactions] = await db.query('SELECT * FROM transactions WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId]);
        if (transactions.length === 0) {
            return res.status(404).json({ error: 'Lançamento não encontrado' });
        }
        res.json(transactions[0]);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ error: 'Erro ao buscar lançamento' });
    }
};

// Create transaction
exports.create = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const { id, description, amount, type, account_id, category_id, date } = req.body;
        await db.query(
            'INSERT INTO transactions (id, description, amount, type, account_id, category_id, date, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, description, amount, type, account_id, category_id || null, date, tenantId]
        );
        res.status(201).json({ id, description, amount, type, accountId: account_id, categoryId: category_id, date });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Erro ao criar lançamento' });
    }
};

// Update transaction
exports.update = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const { description, amount, type, account_id, category_id, date } = req.body;
        const [result] = await db.query(
            'UPDATE transactions SET description = ?, amount = ?, type = ?, account_id = ?, category_id = ?, date = ? WHERE id = ? AND tenant_id = ?',
            [description, amount, type, account_id, category_id || null, date, req.params.id, tenantId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Lançamento não encontrado' });
        }
        
        res.json({ id: req.params.id, description, amount, type, accountId: account_id, categoryId: category_id, date });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: 'Erro ao atualizar lançamento' });
    }
};

// Delete transaction
exports.delete = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const [result] = await db.query('DELETE FROM transactions WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Lançamento não encontrado' });
        }
        
        res.json({ message: 'Lançamento excluído com sucesso' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Erro ao excluir lançamento' });
    }
};
