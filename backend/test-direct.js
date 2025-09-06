const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Extract credentials from DATABASE_URI
const dbUri = process.env.DATABASE_URI;
const [protocol, credentials, host, path] = dbUri.split(/:|@|\/\//);
const [username, password] = credentials.split(':');
const [hostname, port] = host.split(':');
const database = path.split('/')[1];

console.log('Database connection details:');
console.log('Host:', hostname);
console.log('Port:', port);
console.log('Database:', database);

const client = new Client({
    user: username,
    host: hostname,
    database: database,
    password: password,
    port: parseInt(port),
    ssl: {
        rejectUnauthorized: false,
        mode: 'disable',
    },
    connectionTimeoutMillis: 10000, // 10 second timeout
});

client.on('error', (err) => {
    console.error('Client error:', err);
});

async function testConnection() {
    try {
        console.log('\nAttempting direct connection...');
        await client.connect();
        console.log('Successfully connected!');
        
        // Test a simple query
        const res = await client.query('SELECT NOW()');
        console.log('Server time:', res.rows[0].now);
        
        // List tables
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
    } catch (err) {
        console.error('Connection error:', err);
        console.error('Error details:', {
            code: err.code,
            message: err.message,
            detail: err.detail,
            stack: err.stack
        });
    }
}

testConnection();
