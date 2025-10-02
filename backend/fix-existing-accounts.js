const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAccounts() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('🔄 Atualizando contas sem icon/color...\n');
        
        // Update accounts that don't have icon or color
        const [result] = await connection.query(`
            UPDATE accounts 
            SET icon = 'wallet', color = 'purple' 
            WHERE icon IS NULL OR color IS NULL
        `);
        
        console.log(`✅ ${result.affectedRows} contas atualizadas com icon/color padrão`);
        
        // Show all accounts
        const [accounts] = await connection.query('SELECT id, name, icon, color FROM accounts LIMIT 10');
        console.log('\n📊 Primeiras 10 contas:');
        console.table(accounts);
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await connection.end();
    }
}

fixAccounts();
