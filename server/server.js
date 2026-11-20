
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(cors());
app.use(express.json());

// Главная страница API
app.get("/", (req, res) => {
    res.send("Daylist API is running!");
});

// Создание таблиц при запуске сервера
async function initializeDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(20) NOT NULL UNIQUE,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log("Таблицы PostgreSQL готовы.");
}

// Поиск пользователя по имени
async function findUser(username) {
    const result = await pool.query(
        "SELECT id, username FROM users WHERE LOWER(username) = LOWER($1)",
        [username]
    );

    return result.rows[0];
}

// Проверка имени пользователя
function validateUsername(username) {
    return (
        typeof username === "string" &&
        /^[a-zA-Zа-яА-ЯёЁ0-9_-]{3,20}$/.test(username)
    );
}

// Проверка авторизации через заголовок X-Username
async function getCurrentUser(req, res, next) {
    try {
        const username = req.headers["x-username"];

        if (!username) {
            return res.status(401).json({
                error: "Необходимо войти в аккаунт."
            });
        }

        const user = await findUser(username);

        if (!user) {
            return res.status(401).json({
                error: "Пользователь не найден."
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Ошибка проверки пользователя."
        });
    }
}

// Форматирование задачи для Frontend
function formatTask(task) {
    return {
        id: task.id,
        title: task.title,
        description: task.description,
        completed: task.completed,
        createdAt: task.created_at
    };
}

// Регистрация
app.post("/api/register", async (req, res) => {
    try {
        const { username } = req.body;

        if (!validateUsername(username)) {
            return res.status(400).json({
                error: "Имя должно содержать от 3 до 20 символов: буквы, цифры, _ или -."
            });
        }

        const existingUser = await findUser(username);

        if (existingUser) {
            return res.status(409).json({
                error: "Такой пользователь уже существует."
            });
        }

        const result = await pool.query(
            "INSERT INTO users (username) VALUES ($1) RETURNING id, username",
            [username]
        );

        res.status(201).json({
            message: "Регистрация успешна.",
            username: result.rows[0].username
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Ошибка регистрации."
        });
    }
});

// Вход
app.post("/api/login", async (req, res) => {
    try {
        const { username } = req.body;

        if (!validateUsername(username)) {
            return res.status(400).json({
                error: "Некорректное имя пользователя."
            });
        }

        const user = await findUser(username);

        if (!user) {
            return res.status(404).json({
                error: "Пользователь не найден."
            });
        }

        res.json({
            message: "Вход выполнен успешно.",
            username: user.username
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Ошибка входа."
        });
    }
});

// Получение задач текущего пользователя
app.get("/api/tasks", getCurrentUser, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM tasks
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json(result.rows.map(formatTask));

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Не удалось получить задачи."
        });
    }
});

// Добавление задачи
app.post("/api/tasks", getCurrentUser, async (req, res) => {
    try {
        const { title, description } = req.body;

        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                error: "Название задачи обязательно."
            });
        }

        const result = await pool.query(
            `INSERT INTO tasks (user_id, title, description)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [
                req.user.id,
                title.trim(),
                typeof description === "string" ? description : ""
            ]
        );

        res.status(201).json(formatTask(result.rows[0]));

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Не удалось добавить задачу."
        });
    }
});

// Изменение задачи
app.put("/api/tasks/:id", getCurrentUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, completed } = req.body;

        const existing = await pool.query(
            "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
            [id, req.user.id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                error: "Задача не найдена."
            });
        }

        const oldTask = existing.rows[0];

        const newTitle = title !== undefined ? title : oldTask.title;
        const newDescription = description !== undefined
            ? description
            : oldTask.description;

        const newCompleted = completed !== undefined
            ? completed
            : oldTask.completed;

        if (
            typeof newTitle !== "string" ||
            !newTitle.trim() ||
            typeof newDescription !== "string" ||
            typeof newCompleted !== "boolean"
        ) {
            return res.status(400).json({
                error: "Некорректные данные задачи."
            });
        }

        const result = await pool.query(
            `UPDATE tasks
             SET title = $1,
                 description = $2,
                 completed = $3
             WHERE id = $4 AND user_id = $5
             RETURNING *`,
            [
                newTitle.trim(),
                newDescription,
                newCompleted,
                id,
                req.user.id
            ]
        );

        res.json(formatTask(result.rows[0]));

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Не удалось изменить задачу."
        });
    }
});

// Удаление задачи
app.delete("/api/tasks/:id", getCurrentUser, async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id",
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Задача не найдена."
            });
        }

        res.json({
            message: "Задача удалена."
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Не удалось удалить задачу."
        });
    }
});

// Запуск сервера
async function startServer() {
    try {
        await initializeDatabase();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });

    } catch (error) {
        console.error("Ошибка запуска сервера:", error);
        process.exit(1);
    }
}

startServer();
