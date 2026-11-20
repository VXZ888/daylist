
import { useEffect, useState } from "react";

import Auth from "./components/Auth";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

import "./App.css";

function App() {
    const [username, setUsername] = useState(
        () => localStorage.getItem("daylist_username") || ""
    );

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Общие заголовки запросов
    const getHeaders = () => ({
        "Content-Type": "application/json",
        "X-Username": username
    });

    // Загрузка задач пользователя
    useEffect(() => {
        if (!username) {
            setTasks([]);
            setLoading(false);
            return;
        }

        const loadTasks = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch("/api/tasks", {
                    headers: getHeaders()
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Ошибка загрузки.");
                }

                setTasks(data);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadTasks();
    }, [username]);

    // Вход в аккаунт
    const handleLogin = (name) => {
        localStorage.setItem("daylist_username", name);
        setUsername(name);
    };

    // Выход из аккаунта
    const handleLogout = () => {
        localStorage.removeItem("daylist_username");

        setUsername("");
        setTasks([]);
        setError("");
    };

    // Добавление задачи
    const handleAddTask = async (title, description) => {
        try {
            setError("");

            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    title,
                    description
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Ошибка добавления.");
            }

            setTasks((current) => [data, ...current]);

            return true;

        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    // Удаление задачи
    const handleDeleteTask = async (id) => {
        try {
            setError("");

            const response = await fetch(`/api/tasks/${id}`, {
                method: "DELETE",
                headers: getHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Ошибка удаления.");
            }

            setTasks((current) =>
                current.filter((task) => task.id !== id)
            );

        } catch (err) {
            setError(err.message);
        }
    };

    // Изменение статуса
    const handleToggleTask = async (task) => {
        try {
            setError("");

            const response = await fetch(`/api/tasks/${task.id}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify({
                    completed: !task.completed
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Ошибка обновления.");
            }

            setTasks((current) =>
                current.map((item) =>
                    item.id === data.id ? data : item
                )
            );

        } catch (err) {
            setError(err.message);
        }
    };

    // Если пользователь не вошёл, показываем авторизацию
    if (!username) {
        return <Auth onLogin={handleLogin} />;
    }

    const currentDate = new Date();

    const month = currentDate.toLocaleDateString("ru-RU", {
        month: "long"
    });

    return (
        <div className="app-shell">

            <header className="topbar">

                <div className="brand">
                    <span className="brand-symbol">✓</span>
                    <span>Daylist</span>
                </div>

                <div className="user-panel">
                    <span className="username">
                        {username}
                    </span>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                        type="button"
                    >
                        Выйти
                    </button>
                </div>

            </header>

            <main className="main-content">

                <section className="hero">

                    <div className="hero-content">

                        <div className="hero-label">
                            <span></span>
                            ВАШЕ ПРОСТРАНСТВО ДЛЯ ПЛАНОВ
                        </div>

                        <h1>
                            Порядок в делах.
                            <br />
                            <span>Свобода в голове.</span>
                        </h1>

                        <p className="hero-description">
                            Добро пожаловать, {username}!
                            Планируйте свои дела и следите
                            за выполнением задач.
                        </p>

                    </div>

                    <div className="date-card">

                        <span className="date-number">
                            {currentDate.getDate()}
                        </span>

                        <span className="date-month">
                            {month}
                        </span>

                        <span className="date-caption">
                            НОВЫЙ ДЕНЬ — НОВЫЕ ПЛАНЫ
                        </span>

                    </div>

                </section>

                <section className="workspace">

                    <aside className="form-column">

                        <TaskForm onAddTask={handleAddTask} />

                        <div className="tip-card">
                            <span className="tip-icon">✦</span>

                            <h3>Маленький совет</h3>

                            <p>
                                Большие достижения начинаются
                                с небольших, но регулярных шагов.
                            </p>
                        </div>

                    </aside>

                    <div className="tasks-column">

                        {error && (
                            <div className="api-error" role="alert">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="empty-state">
                                Загружаем задачи...
                            </div>
                        ) : (
                            <TaskList
                                tasks={tasks}
                                onDeleteTask={handleDeleteTask}
                                onToggleTask={handleToggleTask}
                            />
                        )}

                    </div>

                </section>

            </main>

            <footer className="footer">
                <span>Daylist © 2026</span>
                <span>Ваши планы — в ваших руках.</span>
            </footer>

        </div>
    );
}

export default App;
