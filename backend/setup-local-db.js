const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Create a new client for local database
const client = new Client({
    user: 'amrut',
    host: 'localhost',
    database: 'postgres',
    password: process.env.LOCAL_DB_PASSWORD,  // Make sure this matches your PostgreSQL password
    port: 5432,
});

async function setupDatabase() {
    try {
        // Connect to the default postgres database
        await client.connect();
        console.log('Connected to PostgreSQL successfully!');

        // Create our database
        await client.query(`
            CREATE DATABASE finance_tracker;
        `);
        console.log('Created database: finance_tracker');

        // Connect to our new database
        await client.end();
        client.database = 'finance_tracker';
        await client.connect();

        // Create tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS tbluser (
                id SERIAL PRIMARY KEY,
                firstname VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS tblcategory (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
                user_id INTEGER REFERENCES tbluser(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS tbltransaction (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES tbluser(id),
                category_id INTEGER REFERENCES tblcategory(id),
                amount DECIMAL(10,2) NOT NULL,
                description TEXT,
                date DATE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Created all tables successfully!');

        // Test the tables
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log('\nTables in database:');
        tables.rows.forEach(table => {
            console.log('- ' + table.table_name);
        });

        await client.end();
        console.log('\nDatabase setup completed successfully!');
    } catch (error) {
        console.error('Error setting up database:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            detail: error.detail,
            stack: error.stack
        });
        if (client) {
            await client.end();
        }
    }
}

setupDatabase();
