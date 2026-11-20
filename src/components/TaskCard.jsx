
function TaskCard({ task, onDelete, onToggle }) {
    const formattedDate = task.createdAt
        ? new Date(task.createdAt).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "short"
        })
        : "";

    return (
        <article
            className={`task-card ${
                task.completed ? "task-card-completed" : ""
            }`}
        >
            <div className="task-card-top">
                <span
                    className={`task-status ${
                        task.completed ? "completed" : ""
                    }`}
                >
                    <span className="status-dot"></span>

                    {task.completed ? "Выполнена" : "В работе"}
                </span>

                <span className="task-date">
                    {formattedDate}
                </span>
            </div>

            <h3>{task.title}</h3>

            <p className="task-description">
                {task.description || "Описание не указано."}
            </p>

            <div className="task-card-footer">
                <span className="task-category">
                    Личная задача
                </span>

                <div className="task-actions">
                    <button
                        className="complete-button"
                        type="button"
                        onClick={onToggle}
                    >
                        {task.completed ? "Вернуть" : "Готово"}
                    </button>

                    <button
                        className="delete-button"
                        type="button"
                        onClick={onDelete}
                        aria-label={`Удалить задачу: ${task.title}`}
                    >
                        Удалить <span>×</span>
                    </button>
                </div>
            </div>
        </article>
    );
}

export default TaskCard;
