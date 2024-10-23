const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function connectDB() {
    const db = await open({
        filename: path.join(__dirname, 'db', 'database.sqlite'),
        driver: sqlite3.Database,
    });
    return db;
}

async function initDb() {
    const db = await connectDB();
    await db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL
        )
    `);
    await db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            description TEXT
        )
    `);
    await db.close();
}

async function addTransaction(transaction) {
    const db = await connectDB();
    const sql = `INSERT INTO transactions (type, category, amount, date, description) VALUES (?, ?, ?, ?, ?)`;
    const result = await db.run(sql, [transaction.type, transaction.category, transaction.amount, transaction.date, transaction.description]);
    await db.close();
    return result.lastID;
}

async function getAllTransactions() {
    const db = await connectDB();
    const sql = `SELECT * FROM transactions`;
    const rows = await db.all(sql);
    await db.close();
    return rows;
}

async function getTransactionById(id) {
    const db = await connectDB();
    const sql = `SELECT * FROM transactions WHERE id = ?`;
    const row = await db.get(sql, [id]);
    await db.close();
    return row;
}

async function updateTransaction(id, transaction) {
    const db = await connectDB();
    const sql = `UPDATE transactions SET type = ?, category = ?, amount = ?, date = ?, description = ? WHERE id = ?`;
    const result = await db.run(sql, [transaction.type, transaction.category, transaction.amount, transaction.date, transaction.description, id]);
    await db.close();
    return result.changes;
}

async function deleteTransaction(id) {
    const db = await connectDB();
    const sql = `DELETE FROM transactions WHERE id = ?`;
    const result = await db.run(sql, [id]);
    await db.close();
    return result.changes;
}

async function getTransactionSummary() {
    const db = await connectDB();
    const sql = `
        SELECT 
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS totalIncome,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS totalExpenses
        FROM transactions
    `;
    const row = await db.get(sql);
    await db.close();
    return row;
}

module.exports = {
    connectDB,
    initDb,
    addTransaction,
    getAllTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getTransactionSummary,
};
