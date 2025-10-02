const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixBalances() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('🔄 Corrigindo saldos...\n');
        
        // Conta Nubank deve ter R$ 2.996,17
        await connection.query(
            'UPDATE accounts SET balance = 2996.17 WHERE id = ?',
            ['acc_1759364382838']
        );
        console.log('✅ Nubank: saldo atualizado para R$ 2.996,17');
        
        // Conta Emergência já está correta (R$ 3.000,00)
        console.log('✅ Emergência: saldo já está correto (R$ 3.000,00)');
        
        console.log('\n✨ Saldos corrigidos!');
        console.log('📊 Novo saldo total: R$ 5.996,17');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await connection.end();
    }
}

fixBalances();
