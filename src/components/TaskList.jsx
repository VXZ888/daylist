
import TaskCard from "./TaskCard";

function TaskList({ tasks, onDeleteTask, onToggleTask }) {
    return (
        <section className="tasks-section">
            <div className="section-heading">
                <div>
                    <p className="section-label">ВАШ ПЛАН</p>

                    <h2>
                        Мои задачи
                        <span className="task-count">
                            {tasks.length}
                        </span>
                    </h2>
                </div>
            </div>

            {tasks.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">✓</div>

                    <h3>Пока здесь пусто</h3>

                    <p>
                        Добавьте первую задачу с помощью формы,
                        и она появится здесь.
                    </p>
                </div>
            ) : (
                <div className="tasks-grid">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onDelete={() => onDeleteTask(task.id)}
                            onToggle={() => onToggleTask(task)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

export default TaskList;
