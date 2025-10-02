const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('🔍 Verificando estrutura da tabela accounts...\n');
        
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'accounts'
            ORDER BY ORDINAL_POSITION
        `, [process.env.DB_NAME]);
        
        console.log('📊 Estrutura da tabela accounts:');
        console.table(columns);
        
        const idColumn = columns.find(c => c.COLUMN_NAME === 'id');
        if (idColumn) {
            console.log(`\n✅ Coluna 'id' encontrada:`);
            console.log(`   Tipo: ${idColumn.DATA_TYPE}`);
            console.log(`   Tamanho: ${idColumn.CHARACTER_MAXIMUM_LENGTH || 'N/A'}`);
            console.log(`\n💡 Use VARCHAR(${idColumn.CHARACTER_MAXIMUM_LENGTH || 255}) nas foreign keys!`);
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await connection.end();
    }
}

checkSchema();
