import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Log the database URI (without password)
const dbUri = process.env.DATABASE_URI;
console.log('Attempting to connect to database:', dbUri?.split('@')[1]);

// Try a simpler connection with explicit SSL settings
const client = new pg.Client({
    connectionString: dbUri,
    ssl: {
        rejectUnauthorized: false,
        ca: null,  // Disable certificate verification
    }
});

async function testConnection() {
    try {
        console.log('Attempting to connect...');
        await client.connect();
        console.log('Successfully connected to database!');
        
        // Test a simple query
        const result = await client.query('SELECT NOW()');
        console.log('Database time:', result.rows[0].now);
        
        // List tables
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log('Tables in database:', tables.rows.map(t => t.table_name));
        
        await client.end();
    } catch (error) {
        console.error('Database connection error:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            detail: error.detail,
            stack: error.stack
        });
        process.exit(1);
    }
}

testConnection();
