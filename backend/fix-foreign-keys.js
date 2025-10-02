const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixForeignKeys() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('🔍 Verificando estrutura das tabelas...\n');
        
        // Check accounts table
        const [accountCols] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'accounts' AND COLUMN_NAME = 'id'
        `, [process.env.DB_NAME]);
        
        if (accountCols.length === 0) {
            console.error('❌ Tabela accounts não encontrada!');
            return;
        }
        
        const accountIdType = accountCols[0];
        console.log(`✅ accounts.id: ${accountIdType.DATA_TYPE}(${accountIdType.CHARACTER_MAXIMUM_LENGTH})`);
        
        // Check if transfers table exists
        const [tables] = await connection.query(`
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'transfers'
        `, [process.env.DB_NAME]);
        
        if (tables.length === 0) {
            console.log('❌ Tabela transfers não existe!');
            return;
        }
        
        console.log('\n🔄 Recriando tabela transfers com foreign keys corretas...\n');
        
        // Drop existing table
        await connection.query('DROP TABLE IF EXISTS transfers');
        console.log('✅ Tabela antiga removida');
        
        // Create new table with proper foreign keys
        const idType = `${accountIdType.DATA_TYPE}(${accountIdType.CHARACTER_MAXIMUM_LENGTH})`;
        await connection.query(`
            CREATE TABLE transfers (
                id ${idType} PRIMARY KEY,
                description VARCHAR(255) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                from_account_id ${idType} NOT NULL,
                to_account_id ${idType} NOT NULL,
                date DATE NOT NULL,
                tenant_id VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_transfer_from_account 
                    FOREIGN KEY (from_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
                CONSTRAINT fk_transfer_to_account 
                    FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
                INDEX idx_tenant_id (tenant_id),
                INDEX idx_from_account (from_account_id),
                INDEX idx_to_account (to_account_id),
                INDEX idx_date (date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Tabela transfers recriada com foreign keys!');
        
        console.log('\n✨ Foreign keys configuradas corretamente!');
        console.log('\n📋 Estrutura final:');
        console.log(`   - from_account_id: ${idType}`);
        console.log(`   - to_account_id: ${idType}`);
        console.log(`   - FOREIGN KEY → accounts(id) ON DELETE CASCADE`);
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await connection.end();
    }
}

fixForeignKeys();
