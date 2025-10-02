const db = require('../config/database');

// Get all transfers
exports.getAll = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const [transfers] = await db.query(
            'SELECT * FROM transfers WHERE tenant_id = ? ORDER BY date DESC, created_at DESC',
            [tenantId]
        );
        res.json(transfers);
    } catch (error) {
        console.error('Error fetching transfers:', error);
        res.status(500).json({ error: 'Erro ao buscar transferências' });
    }
};

// Get transfer by ID
exports.getById = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const [transfers] = await db.query(
            'SELECT * FROM transfers WHERE id = ? AND tenant_id = ?',
            [req.params.id, tenantId]
        );
        if (transfers.length === 0) {
            return res.status(404).json({ error: 'Transferência não encontrada' });
        }
        res.json(transfers[0]);
    } catch (error) {
        console.error('Error fetching transfer:', error);
        res.status(500).json({ error: 'Erro ao buscar transferência' });
    }
};

// Create transfer
exports.create = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const tenantId = req.tenantId;
        const { id, description, amount, from_account_id, to_account_id, date } = req.body;
        
        // Validate accounts exist and belong to tenant
        const [fromAccounts] = await connection.query(
            'SELECT * FROM accounts WHERE id = ? AND tenant_id = ?',
            [from_account_id, tenantId]
        );
        const [toAccounts] = await connection.query(
            'SELECT * FROM accounts WHERE id = ? AND tenant_id = ?',
            [to_account_id, tenantId]
        );
        
        if (fromAccounts.length === 0 || toAccounts.length === 0) {
            return res.status(404).json({ error: 'Conta não encontrada' });
        }
        
        if (from_account_id === to_account_id) {
            return res.status(400).json({ error: 'Não é possível transferir para a mesma conta' });
        }
        
        // Start transaction
        await connection.beginTransaction();
        
        // Create transfer record
        await connection.query(
            'INSERT INTO transfers (id, description, amount, from_account_id, to_account_id, date, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, description, amount, from_account_id, to_account_id, date, tenantId]
        );
        
        // Update account balances
        await connection.query(
            'UPDATE accounts SET balance = balance - ? WHERE id = ? AND tenant_id = ?',
            [amount, from_account_id, tenantId]
        );
        await connection.query(
            'UPDATE accounts SET balance = balance + ? WHERE id = ? AND tenant_id = ?',
            [amount, to_account_id, tenantId]
        );
        
        await connection.commit();
        
        res.status(201).json({ 
            id, 
            description, 
            amount, 
            fromAccountId: from_account_id, 
            toAccountId: to_account_id, 
            date 
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating transfer:', error);
        res.status(500).json({ error: 'Erro ao criar transferência' });
    } finally {
        connection.release();
    }
};

// Delete transfer
exports.delete = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const tenantId = req.tenantId;
        
        // Get transfer details
        const [transfers] = await connection.query(
            'SELECT * FROM transfers WHERE id = ? AND tenant_id = ?',
            [req.params.id, tenantId]
        );
        
        if (transfers.length === 0) {
            return res.status(404).json({ error: 'Transferência não encontrada' });
        }
        
        const transfer = transfers[0];
        
        // Start transaction
        await connection.beginTransaction();
        
        // Revert account balances
        await connection.query(
            'UPDATE accounts SET balance = balance + ? WHERE id = ? AND tenant_id = ?',
            [transfer.amount, transfer.from_account_id, tenantId]
        );
        await connection.query(
            'UPDATE accounts SET balance = balance - ? WHERE id = ? AND tenant_id = ?',
            [transfer.amount, transfer.to_account_id, tenantId]
        );
        
        // Delete transfer
        await connection.query(
            'DELETE FROM transfers WHERE id = ? AND tenant_id = ?',
            [req.params.id, tenantId]
        );
        
        await connection.commit();
        
        res.json({ message: 'Transferência excluída com sucesso' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting transfer:', error);
        res.status(500).json({ error: 'Erro ao excluir transferência' });
    } finally {
        connection.release();
    }
};
