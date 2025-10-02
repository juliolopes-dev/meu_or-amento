const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('🔄 Adicionando colunas icon e color à tabela accounts...');
        
        // Check if columns exist
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'accounts'
        `, [process.env.DB_NAME]);
        
        const columnNames = columns.map(c => c.COLUMN_NAME);
        
        // Add icon column if doesn't exist
        if (!columnNames.includes('icon')) {
            await connection.query(`ALTER TABLE accounts ADD COLUMN icon VARCHAR(50) DEFAULT 'wallet'`);
            console.log('✅ Coluna icon adicionada');
        } else {
            console.log('ℹ️  Coluna icon já existe');
        }
        
        // Add color column if doesn't exist
        if (!columnNames.includes('color')) {
            await connection.query(`ALTER TABLE accounts ADD COLUMN color VARCHAR(50) DEFAULT 'purple'`);
            console.log('✅ Coluna color adicionada');
        } else {
            console.log('ℹ️  Coluna color já existe');
        }
        
        // Update existing accounts
        await connection.query(`
            UPDATE accounts 
            SET icon = 'wallet', color = 'purple' 
            WHERE icon IS NULL OR color IS NULL
        `);
        console.log('✅ Contas existentes atualizadas');
        
        console.log('✨ Migração concluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro na migração:', error);
        console.error('Stack:', error.stack);
    } finally {
        await connection.end();
    }
}

migrate();
