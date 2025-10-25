const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT
        });

        console.log('OK  Conectado ao MySQL');

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        console.log(`OK  Database '${process.env.DB_NAME}' verificado`);
        await connection.query(`USE \`${process.env.DB_NAME}\``);

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

        await connection.query(`
            CREATE TABLE IF NOT EXISTS accounts (
                id VARCHAR(50) PRIMARY KEY,
                tenant_id VARCHAR(50) NOT NULL,
                name VARCHAR(100) NOT NULL,
                balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
                icon VARCHAR(50) DEFAULT 'wallet',
                color VARCHAR(50) DEFAULT 'purple',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
            )
        `);
        console.log('OK  Tabela "accounts" criada');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id VARCHAR(50) PRIMARY KEY,
                tenant_id VARCHAR(50) NOT NULL,
                name VARCHAR(100) NOT NULL,
                parent_id VARCHAR(50) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
                FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
            )
        `);
        console.log('OK  Tabela "categories" criada');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id VARCHAR(50) PRIMARY KEY,
                tenant_id VARCHAR(50) NOT NULL,
                description VARCHAR(255) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                type ENUM('income', 'expense') NOT NULL,
                account_id VARCHAR(50) NOT NULL,
                category_id VARCHAR(50) NULL,
                date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
                FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            )
        `);
        console.log('OK  Tabela "transactions" criada');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS budget_items (
                id VARCHAR(50) PRIMARY KEY,
                tenant_id VARCHAR(50) NOT NULL,
                category_id VARCHAR(50) NULL,
                value DECIMAL(15, 2) NOT NULL,
                type ENUM('fixed', 'percentage') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
            )
        `);
        console.log('OK  Tabela "budget_items" criada');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS payables (
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
        console.log('\nBanco de dados inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initializeDatabase();
