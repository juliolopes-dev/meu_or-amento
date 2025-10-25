const db = require('../config/database');

const toBoolean = (value) => value === true || value === 1 || value === '1' || value === 'true';

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseInstallments = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
};

async function validateCategory(connection, tenantId, categoryId) {
    const [rows] = await connection.query(
        'SELECT id FROM categories WHERE id = ? AND tenant_id = ?',
        [categoryId, tenantId]
    );
    return rows.length > 0;
}

exports.getAll = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const [payables] = await db.query(
            `SELECT p.*, c.name AS category_name
             FROM payables p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.tenant_id = ?
             ORDER BY p.status = 'pending' DESC, p.due_date ASC`,
            [tenantId]
        );
        res.json(payables);
    } catch (error) {
        console.error('Error fetching payables:', error);
        res.status(500).json({ error: 'Erro ao buscar contas a pagar' });
    }
};

exports.create = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const tenantId = req.tenantId;
        const {
            id,
            description,
            amount,
            due_date,
            category_id,
            is_recurring,
            notes,
            total_installments
        } = req.body;

        if (!description || !amount || !due_date || !category_id) {
            return res.status(400).json({ error: 'Descrição, valor, vencimento e categoria são obrigatórios' });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({ error: 'O valor deve ser maior que zero' });
        }

        const installmentsCount = parseInstallments(total_installments);
        const recurringFlag = toBoolean(is_recurring) ? 1 : 0;

        if (!recurringFlag && installmentsCount !== null) {
            return res.status(400).json({ error: 'Parcelas só podem ser usadas em contas fixas' });
        }

        await connection.beginTransaction();

        const categoryIsValid = await validateCategory(connection, tenantId, category_id);
        if (!categoryIsValid) {
            await connection.rollback();
            return res.status(400).json({ error: 'Categoria inválida' });
        }

        const payableId = id || `pay_${Date.now()}`;
        await connection.query(
            `INSERT INTO payables
                (id, tenant_id, description, amount, due_date, category_id, is_recurring, total_installments, current_installment, status, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
            [
                payableId,
                tenantId,
                description,
                Number(amount),
                due_date,
                category_id,
                recurringFlag,
                installmentsCount,
                recurringFlag ? 1 : null,
                notes || null
            ]
        );

        await connection.commit();
        res.status(201).json({
            id: payableId,
            message: 'Conta a pagar criada com sucesso'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating payable:', error);
        res.status(500).json({ error: 'Erro ao criar conta a pagar' });
    } finally {
        connection.release();
    }
};

exports.update = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const tenantId = req.tenantId;
        const payableId = req.params.id;
        const {
            description,
            amount,
            due_date,
            category_id,
            is_recurring,
            notes,
            total_installments
        } = req.body;

        const [existingRows] = await connection.query(
            'SELECT * FROM payables WHERE id = ? AND tenant_id = ?',
            [payableId, tenantId]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({ error: 'Conta a pagar não encontrada' });
        }

        const existing = existingRows[0];
        const installmentsCount = parseInstallments(total_installments);
        const recurringFlag = typeof is_recurring === 'undefined' ? existing.is_recurring : (toBoolean(is_recurring) ? 1 : 0);

        if (!recurringFlag && installmentsCount !== null) {
            return res.status(400).json({ error: 'Parcelas só podem ser usadas em contas fixas' });
        }

        if (installmentsCount !== null && existing.current_installment && installmentsCount < existing.current_installment) {
            return res.status(400).json({ error: 'Quantidade de parcelas não pode ser menor que o número já pago' });
        }

        const categoryToUse = category_id || existing.category_id;
        if (category_id && category_id !== existing.category_id) {
            const categoryIsValid = await validateCategory(connection, tenantId, category_id);
            if (!categoryIsValid) {
                return res.status(400).json({ error: 'Categoria inválida' });
            }
        }

        const currentInstallment = recurringFlag ? (existing.current_installment || 1) : null;

        await connection.query(
            `UPDATE payables
             SET description = ?, amount = ?, due_date = ?, category_id = ?, is_recurring = ?, notes = ?, total_installments = ?, current_installment = ?, updated_at = NOW()
             WHERE id = ? AND tenant_id = ?`,
            [
                description || existing.description,
                amount !== undefined ? Number(amount) : existing.amount,
                due_date || existing.due_date,
                categoryToUse,
                recurringFlag,
                notes !== undefined ? notes : existing.notes,
                recurringFlag ? installmentsCount : null,
                currentInstallment,
                payableId,
                tenantId
            ]
        );

        res.json({ message: 'Conta a pagar atualizada com sucesso' });
    } catch (error) {
        console.error('Error updating payable:', error);
        res.status(500).json({ error: 'Erro ao atualizar conta a pagar' });
    } finally {
        connection.release();
    }
};

exports.remove = async (req, res) => {
    try {
        const tenantId = req.tenantId;
        const payableId = req.params.id;

        const [existing] = await db.query(
            'SELECT status FROM payables WHERE id = ? AND tenant_id = ?',
            [payableId, tenantId]
        );

        if (!existing.length) {
            return res.status(404).json({ error: 'Conta a pagar não encontrada' });
        }

        if (existing[0].status !== 'pending') {
            return res.status(400).json({ error: 'Somente contas pendentes podem ser excluídas' });
        }

        await db.query(
            'DELETE FROM payables WHERE id = ? AND tenant_id = ?',
            [payableId, tenantId]
        );

        res.json({ message: 'Conta a pagar excluída com sucesso' });
    } catch (error) {
        console.error('Error deleting payable:', error);
        res.status(500).json({ error: 'Erro ao excluir conta a pagar' });
    }
};

exports.pay = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const tenantId = req.tenantId;
        const payableId = req.params.id;
        const { account_id, payment_date } = req.body;

        if (!account_id) {
            return res.status(400).json({ error: 'Conta para pagamento é obrigatória' });
        }

        const [payableRows] = await connection.query(
            'SELECT * FROM payables WHERE id = ? AND tenant_id = ?',
            [payableId, tenantId]
        );

        if (!payableRows.length) {
            return res.status(404).json({ error: 'Conta a pagar não encontrada' });
        }

        const payable = payableRows[0];
        if (payable.status !== 'pending') {
            return res.status(400).json({ error: 'Esta conta já foi processada' });
        }

        const [accountRows] = await connection.query(
            'SELECT id, balance FROM accounts WHERE id = ? AND tenant_id = ?',
            [account_id, tenantId]
        );
        if (!accountRows.length) {
            return res.status(404).json({ error: 'Conta não encontrada' });
        }

        const paymentDate = payment_date || formatDate(new Date());
        const transactionId = `trans_${Date.now()}`;

        await connection.beginTransaction();

        await connection.query(
            `INSERT INTO transactions
                (id, description, amount, type, account_id, category_id, date, tenant_id)
             VALUES (?, ?, ?, 'expense', ?, ?, ?, ?)`,
            [
                transactionId,
                payable.description,
                payable.amount,
                account_id,
                payable.category_id,
                paymentDate,
                tenantId
            ]
        );

        await connection.query(
            `UPDATE accounts
             SET balance = balance - ?
             WHERE id = ? AND tenant_id = ?`,
            [payable.amount, account_id, tenantId]
        );

        await connection.query(
            `UPDATE payables
             SET status = 'paid',
                 paid_at = NOW(),
                 paid_account_id = ?,
                 paid_transaction_id = ?,
                 updated_at = NOW()
             WHERE id = ? AND tenant_id = ?`,
            [account_id, transactionId, payableId, tenantId]
        );

        if (payable.is_recurring) {
            const hasLimit = payable.total_installments !== null && payable.total_installments !== undefined;
            const alreadyCompleted = hasLimit && (payable.current_installment || 1) >= payable.total_installments;

            if (!alreadyCompleted) {
                const currentDue = new Date(payable.due_date);
                const nextDue = new Date(currentDue);
                nextDue.setMonth(nextDue.getMonth() + 1);

                const newPayableId = `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                await connection.query(
                    `INSERT INTO payables
                        (id, tenant_id, description, amount, due_date, category_id, is_recurring, total_installments, current_installment, status, notes)
                     VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, 'pending', ?)`,
                    [
                        newPayableId,
                        tenantId,
                        payable.description,
                        payable.amount,
                        formatDate(nextDue),
                        payable.category_id,
                        payable.total_installments,
                        (payable.current_installment || 1) + 1,
                        payable.notes || null
                    ]
                );
            }
        }

        await connection.commit();

        res.json({
            message: 'Conta marcada como paga',
            transactionId,
            paidAt: new Date().toISOString()
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error paying payable:', error);
        res.status(500).json({ error: 'Erro ao marcar conta como paga' });
    } finally {
        connection.release();
    }
};
