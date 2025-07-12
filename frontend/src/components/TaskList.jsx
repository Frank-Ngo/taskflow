function TaskList({ tasks, onDelete }) {
  return (
    <div className="space-y-4 mt-6">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex justify-between items-center bg-white p-4 rounded shadow"
        >
        <span>{task.text}</span>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default TaskList;
