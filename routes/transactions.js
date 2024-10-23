const express = require('express');
const router = express.Router();
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');


async function connectDB() {
    return open({
        filename: path.join(__dirname, '../db/database.sqlite'),
        driver: sqlite3.Database,
    });
}


router.post('/', async (req, res) => {
    const { type, category, amount, date, description } = req.body;
    const db = await connectDB();

    try {
        await db.run('INSERT INTO transactions (type, category, amount, date, description) VALUES (?, ?, ?, ?, ?)', 
        [type, category, amount, date, description]);
        res.status(201).send({ message: 'Transaction added successfully' });
    } catch (err) {
        res.status(500).send({ error: 'Failed to add transaction' });
    } finally {
        await db.close();
    }
});


router.get('/', async (req, res) => {
    const db = await connectDB();
    try {
        const transactions = await db.all('SELECT * FROM transactions');
        res.send(transactions);
    } catch (err) {
        res.status(500).send({ error: 'Failed to retrieve transactions' });
    } finally {
        await db.close();
    }
});


router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const db = await connectDB();
    try {
        const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);
        if (transaction) {
            res.send(transaction);
        } else {
            res.status(404).send({ error: 'Transaction not found' });
        }
    } catch (err) {
        res.status(500).send({ error: 'Failed to retrieve transaction' });
    } finally {
        await db.close();
    }
});

// PUT /transactions/:id - Update a transaction
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { type, category, amount, date, description } = req.body;
    const db = await connectDB();

    try {
        await db.run('UPDATE transactions SET type = ?, category = ?, amount = ?, date = ?, description = ? WHERE id = ?', 
        [type, category, amount, date, description, id]);
        res.send({ message: 'Transaction updated successfully' });
    } catch (err) {
        res.status(500).send({ error: 'Failed to update transaction' });
    } finally {
        await db.close();
    }
});

// DELETE /transactions/:id - Delete a transaction
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const db = await connectDB();

    try {
        await db.run('DELETE FROM transactions WHERE id = ?', [id]);
        res.send({ message: 'Transaction deleted successfully' });
    } catch (err) {
        res.status(500).send({ error: 'Failed to delete transaction' });
    } finally {
        await db.close();
    }
});

// GET /summary - Retrieve a summary of transactions
router.get('/summary', async (req, res) => {
    const db = await connectDB();
    try {
        const summary = await db.get(`
            SELECT
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
            FROM transactions
        `);
        summary.balance = summary.total_income - summary.total_expense;
        res.send(summary);
    } catch (err) {
        res.status(500).send({ error: 'Failed to retrieve summary' });
    } finally {
        await db.close();
    }
});

module.exports = router;
 