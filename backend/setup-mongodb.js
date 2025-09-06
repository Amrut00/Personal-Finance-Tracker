const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

async function setupDatabase() {
    try {
        const client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

        console.log('Connecting to MongoDB...');
        await client.connect();

        const db = client.db('personal_finance_tracker');

        // Drop existing collections if they exist
        console.log('Dropping existing collections...');
        await db.dropCollection('users', { ifExists: true });
        await db.dropCollection('categories', { ifExists: true });
        await db.dropCollection('transactions', { ifExists: true });

        // Create collections with indexes
        console.log('Creating collections with indexes...');

        // Users collection
        const users = await db.createCollection('users', {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["firstname", "email", "password"],
                    properties: {
                        firstname: {
                            bsonType: "string",
                            minLength: 2
                        },
                        email: {
                            bsonType: "string",
                            pattern: "^\\S+@\\S+\\.\\S+$"
                        },
                        password: {
                            bsonType: "string"
                        }
                    }
                }
            }
        });
        await users.createIndex({ email: 1 }, { unique: true });

        // Categories collection
        const categories = await db.createCollection('categories', {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["name", "type", "userId"],
                    properties: {
                        name: {
                            bsonType: "string"
                        },
                        type: {
                            enum: ["income", "expense"]
                        },
                        userId: {
                            bsonType: "objectId"
                        }
                    }
                }
            }
        });
        await categories.createIndex({ userId: 1 });

        // Transactions collection
        const transactions = await db.createCollection('transactions', {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["userId", "categoryId", "amount", "date"],
                    properties: {
                        userId: {
                            bsonType: "objectId"
                        },
                        categoryId: {
                            bsonType: "objectId"
                        },
                        amount: {
                            bsonType: "double"
                        },
                        date: {
                            bsonType: "date"
                        },
                        description: {
                            bsonType: "string"
                        }
                    }
                }
            }
        });
        await transactions.createIndex({ userId: 1 });
        await transactions.createIndex({ date: -1 });

        console.log('Database setup completed successfully!');
        
    } catch (error) {
        console.error('Database setup error:', error);
        throw error;
    }
}

setupDatabase().catch(console.dir);
