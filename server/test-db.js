
require("dotenv").config();

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
    console.error("Ошибка: переменная DATABASE_URL не найдена.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3
});

async function testConnection() {
    try {
        const result = await pool.query(
            "SELECT NOW() AS current_time, current_database() AS database_name"
        );

        console.log("Подключение к PostgreSQL успешно!");
        console.log("База данных:", result.rows[0].database_name);
        console.log("Время сервера:", result.rows[0].current_time);

    } catch (error) {
        console.error("Ошибка подключения:", error.message);
        process.exitCode = 1;

    } finally {
        await pool.end();
    }
}

testConnection();
