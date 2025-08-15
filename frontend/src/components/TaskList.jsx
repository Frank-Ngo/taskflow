import { useState } from "react";

function TaskItem({ task, onDelete, onUpdate, onToggleComplete }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(task.text);

  const save = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || trimmed === task.text) {
      setEditing(false);
      setValue(task.text);
      return;
    }
    onUpdate(task.id, trimmed);   // calls PATCH in App.jsx
    setEditing(false);
  };

  const rowClass =
    "flex justify-between items-center bg-white p-4 rounded shadow gap-3 " +
    (task.completed ? "opacity-70" : "");

  if (editing) {
    return (
      <form onSubmit={save} className={rowClass}>
        <input
          autoFocus
          className="flex-1 border rounded px-3 py-2"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Edit task…"
        />
        <div className="flex gap-2">
          <button type="submit" className="px-3 py-2 border rounded">Save</button>
          <button
            type="button"
            onClick={() => { setEditing(false); setValue(task.text); }}
            className="px-3 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={rowClass}>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={!!task.completed}
          onChange={(e) => onToggleComplete(task.id, e.target.checked)}
        />
        <span className={task.completed ? "line-through" : ""}>{task.text}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setEditing(true)} className="px-3 py-1 border rounded">Edit</button>
        <button onClick={() => onDelete(task.id)} className="text-red-500 hover:text-red-700">Delete</button>
      </div>
    </div>
  );
}

export default function TaskList({ tasks, onDelete, onUpdate, onToggleComplete }) {
  return (
    <div className="space-y-4 mt-6">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </div>
  );
}
