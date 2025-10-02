const mysql = require('mysql2/promise');
require('dotenv').config();

async function recalculateBalances() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('🔄 Recalculando saldos das contas...\n');
        
        // Get all accounts
        const [accounts] = await connection.query('SELECT * FROM accounts');
        
        for (const account of accounts) {
            console.log(`\n📊 Conta: ${account.name} (${account.id})`);
            console.log(`   Saldo atual no banco: R$ ${parseFloat(account.balance).toFixed(2)}`);
            
            // Get all transactions for this account
            const [transactions] = await connection.query(
                'SELECT * FROM transactions WHERE account_id = ?',
                [account.id]
            );
            
            // Get all transfers (from and to)
            const [transfersFrom] = await connection.query(
                'SELECT * FROM transfers WHERE from_account_id = ?',
                [account.id]
            );
            const [transfersTo] = await connection.query(
                'SELECT * FROM transfers WHERE to_account_id = ?',
                [account.id]
            );
            
            // Calculate correct balance
            let calculatedBalance = parseFloat(account.balance) || 0;
            
            // Start from initial balance (assuming current balance is the initial)
            // We need to recalculate from scratch
            
            console.log(`   Transações: ${transactions.length}`);
            console.log(`   Transferências (saída): ${transfersFrom.length}`);
            console.log(`   Transferências (entrada): ${transfersTo.length}`);
            
            // For now, let's just show the data
            let totalIncome = 0;
            let totalExpense = 0;
            
            transactions.forEach(t => {
                if (t.type === 'income') {
                    totalIncome += parseFloat(t.amount);
                } else {
                    totalExpense += parseFloat(t.amount);
                }
            });
            
            let totalTransfersOut = transfersFrom.reduce((sum, t) => sum + parseFloat(t.amount), 0);
            let totalTransfersIn = transfersTo.reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            console.log(`   Receitas: R$ ${totalIncome.toFixed(2)}`);
            console.log(`   Despesas: R$ ${totalExpense.toFixed(2)}`);
            console.log(`   Transferências saída: R$ ${totalTransfersOut.toFixed(2)}`);
            console.log(`   Transferências entrada: R$ ${totalTransfersIn.toFixed(2)}`);
        }
        
        console.log('\n✨ Análise concluída!');
        console.log('\n⚠️  Para corrigir os saldos, você precisa:');
        console.log('   1. Resetar o saldo das contas para o valor inicial');
        console.log('   2. Reprocessar todas as transações e transferências');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await connection.end();
    }
}

recalculateBalances();
