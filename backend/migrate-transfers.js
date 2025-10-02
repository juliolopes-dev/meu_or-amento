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
        console.log('🔄 Criando tabela de transferências...');
        
        // Create transfers table (without foreign keys to avoid incompatibility)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS transfers (
                id VARCHAR(255) PRIMARY KEY,
                description VARCHAR(255) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                from_account_id VARCHAR(255) NOT NULL,
                to_account_id VARCHAR(255) NOT NULL,
                date DATE NOT NULL,
                tenant_id VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_tenant_id (tenant_id),
                INDEX idx_from_account (from_account_id),
                INDEX idx_to_account (to_account_id),
                INDEX idx_date (date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Tabela transfers criada');
        
        console.log('✨ Migração concluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro na migração:', error);
        console.error('Stack:', error.stack);
    } finally {
        await connection.end();
    }
}

migrate();
