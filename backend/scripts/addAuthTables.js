const mysql = require('mysql2/promise');
require('dotenv').config();

async function ensureTenantColumn(connection, table) {
    const [columns] = await connection.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = 'tenant_id'`,
        [process.env.DB_NAME, table]
    );
    if (!columns.length) {
        await connection.query(`ALTER TABLE ${table} ADD COLUMN tenant_id VARCHAR(50) NULL`);
        await connection.query(`ALTER TABLE ${table} ADD CONSTRAINT fk_${table}_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE`);
        console.log(`OK  Coluna "tenant_id" adicionada na tabela "${table}"`);
    } else {
        console.log(`OK  Coluna "tenant_id" ja existe na tabela "${table}"`);
    }
}

async function ensurePayablesTable(connection) {
    const [tables] = await connection.query(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'payables'`,
        [process.env.DB_NAME]
    );
    if (!tables.length) {
        await connection.query(`
            CREATE TABLE payables (
                id VARCHAR(50) PRIMARY KEY,
                tenant_id VARCHAR(50) NOT NULL,
                description VARCHAR(255) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                due_date DATE NOT NULL,
                category_id VARCHAR(50) NULL,
                is_recurring TINYINT(1) DEFAULT 0,
                total_installments INT NULL,
                current_installment INT NULL,
                status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
                paid_at DATETIME NULL,
                paid_account_id VARCHAR(50) NULL,
                paid_transaction_id VARCHAR(50) NULL,
                notes TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
                FOREIGN KEY (paid_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
                FOREIGN KEY (paid_transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
            )
        `);
        console.log('OK  Tabela "payables" criada');
    } else {
        console.log('OK  Tabela "payables" ja existe');
        await connection.query(`ALTER TABLE payables ADD COLUMN total_installments INT NULL`, []).catch(() => {});
        await connection.query(`ALTER TABLE payables ADD COLUMN current_installment INT NULL`, []).catch(() => {});
    }
}

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

        console.log('OK  Conectado ao MySQL');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS tenants (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                slug VARCHAR(100) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('OK  Tabela "tenants" criada');

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
        console.log('OK  Tabela "users" criada');

        await ensurePayablesTable(connection);

        const tables = ['accounts', 'categories', 'transactions', 'budget_items', 'payables'];
        for (const table of tables) {
            await ensureTenantColumn(connection, table);
        }

        console.log('\nSistema Multi-Tenant configurado com sucesso!');
    } catch (error) {
        console.error('Erro:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

addAuthTables();
