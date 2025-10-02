const db = require('../config/database');

// Get all accounts
exports.getAll = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const [accounts] = await db.query('SELECT * FROM accounts WHERE tenant_id = ? ORDER BY created_at DESC', [tenantId]);
        res.json(accounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'Erro ao buscar contas' });
    }
};

// Get account by ID
exports.getById = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const [accounts] = await db.query('SELECT * FROM accounts WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId]);
        if (accounts.length === 0) {
            return res.status(404).json({ error: 'Conta não encontrada' });
        }
        res.json(accounts[0]);
    } catch (error) {
        console.error('Error fetching account:', error);
        res.status(500).json({ error: 'Erro ao buscar conta' });
    }
};

// Create account
exports.create = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const { id, name, balance, icon, color } = req.body;
        await db.query(
            'INSERT INTO accounts (id, name, balance, tenant_id, icon, color) VALUES (?, ?, ?, ?, ?, ?)', 
            [id, name, balance, tenantId, icon || 'wallet', color || 'purple']
        );
        res.status(201).json({ id, name, balance, icon, color });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ error: 'Erro ao criar conta' });
    }
};

// Update account
exports.update = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const { name, balance, icon, color } = req.body;
        const [result] = await db.query(
            'UPDATE accounts SET name = ?, balance = ?, icon = ?, color = ? WHERE id = ? AND tenant_id = ?', 
            [name, balance, icon || 'wallet', color || 'purple', req.params.id, tenantId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Conta não encontrada' });
        }
        
        res.json({ id: req.params.id, name, balance, icon, color });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ error: 'Erro ao atualizar conta' });
    }
};

// Delete account
exports.delete = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const [result] = await db.query('DELETE FROM accounts WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Conta não encontrada' });
        }
        
        res.json({ message: 'Conta excluída com sucesso' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Erro ao excluir conta' });
    }
};
