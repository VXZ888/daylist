
import { useState } from "react";

// Адрес опубликованного Backend на Render
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

function Auth({ onLogin }) {
    const [username, setUsername] = useState("");
    const [mode, setMode] = useState("login");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const endpoint = mode === "login"
                ? "/api/login"
                : "/api/register";

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Произошла ошибка.");
            }

            onLogin(data.username);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">

                <div className="auth-brand">
                    <span className="brand-symbol">✓</span>
                    <span>Daylist</span>
                </div>

                <div className="auth-heading">
                    <h1>
                        {mode === "login"
                            ? "С возвращением!"
                            : "Создайте аккаунт"}
                    </h1>

                    <p>
                        {mode === "login"
                            ? "Войдите, чтобы увидеть свои задачи."
                            : "Зарегистрируйтесь, чтобы начать планировать."}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label htmlFor="username">
                            Имя пользователя
                        </label>

                        <input
                            id="username"
                            type="text"
                            placeholder="Введите ваше имя"
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            minLength={3}
                            maxLength={20}
                            required
                        />
                    </div>

                    {error && (
                        <div className="api-error" role="alert">
                            {error}
                        </div>
                    )}

                    <button
                        className="add-button auth-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Подождите..."
                            : mode === "login"
                                ? "Войти"
                                : "Зарегистрироваться"}
                    </button>

                </form>

                <div className="auth-switch">
                    {mode === "login" ? (
                        <>
                            Нет аккаунта?

                            <button
                                type="button"
                                onClick={() => {
                                    setMode("register");
                                    setError("");
                                }}
                            >
                                Регистрация
                            </button>
                        </>
                    ) : (
                        <>
                            Уже зарегистрированы?

                            <button
                                type="button"
                                onClick={() => {
                                    setMode("login");
                                    setError("");
                                }}
                            >
                                Войти
                            </button>
                        </>
                    )}
                </div>

                <p className="auth-note">
                    Учебная версия: вход осуществляется по имени,
                    без пароля.
                </p>

            </div>
        </main>
    );
}

export default Auth;
