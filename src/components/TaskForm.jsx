
import { useState } from "react";

function TaskForm({ onAddTask }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            return;
        }

        const success = await onAddTask(
            trimmedTitle,
            description.trim()
        );

        if (success) {
            setTitle("");
            setDescription("");
        }
    };

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <div className="form-heading">
                <div className="form-icon">+</div>

                <div>
                    <h2>Новая задача</h2>
                    <p>Запишите то, что важно сделать</p>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="task-title">
                    Название задачи
                </label>

                <input
                    id="task-title"
                    type="text"
                    placeholder="Например, подготовить проект"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={60}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="task-description">
                    Описание
                    <span className="optional"> (необязательно)</span>
                </label>

                <textarea
                    id="task-description"
                    placeholder="Добавьте немного подробностей..."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows="4"
                    maxLength={180}
                />
            </div>

            <button className="add-button" type="submit">
                <span>+</span> Добавить задачу
            </button>
        </form>
    );
}

export default TaskForm;
