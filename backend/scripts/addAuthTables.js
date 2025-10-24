const mysql = require('mysql2/promise');
require('dotenv').config();

async function addAuthTables() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('✅ Conectado ao MySQL');

        // Create tenants table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tenants (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                slug VARCHAR(100) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela "tenants" criada');

        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(50) PRIMARY KEY,
                tenant_id VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(100) NOT NULL,
                lastname VARCHAR(100),
                role ENUM('admin', 'user') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_email_per_tenant (tenant_id, email),
                FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Tabela "users" criada');

        // Add tenant_id to existing tables
        const tables = ['accounts', 'categories', 'transactions', 'budget_items', 'payables'];
        
        for (const table of tables) {
            // Check if column exists
            const [columns] = await connection.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = 'tenant_id'
            `, [process.env.DB_NAME, table]);

            if (columns.length === 0) {
                await connection.query(`
                    ALTER TABLE ${table} 
                    ADD COLUMN tenant_id VARCHAR(50) NULL,
                    ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
                `);
                console.log(`✅ Coluna "tenant_id" adicionada à tabela "${table}"`);
            } else {
                console.log(`ℹ️  Coluna "tenant_id" já existe na tabela "${table}"`);
            }
        }

        console.log('\n🎉 Sistema Multi-Tenant configurado com sucesso!');

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

addAuthTables();
