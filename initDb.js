const { initDb } = require('./db/db');

initDb().catch(err => {
    console.error('Error initializing database:', err);
});
