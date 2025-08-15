import { useState, useEffect } from "react";
import Header from "./components/Header";
import TaskList from "./components/TaskList";
import AddTask from "./components/AddTask";

const BACKEND_URL = "http://127.0.0.1:5000"; // or use import.meta.env.VITE_API_URL

export default function App() {
  const [tasks, setTasks] = useState([]);

  // NEW: filter state + derived lists
  const [filter, setFilter] = useState("all"); // all | active | completed
  const visible = tasks.filter(t =>
    filter === "all" ? true :
    filter === "active" ? !t.completed :
    t.completed
  );
  const remaining = tasks.filter(t => !t.completed).length;

  // GET tasks on load
  useEffect(() => {
    fetch(`${BACKEND_URL}/tasks`)
      .then((res) => res.json())
      .then((data) =>
        setTasks(
          data.map((t) => ({
            ...t,
            text: t.title,                 // map Supabase "title" → UI "text"
            completed: !!t.completed,      // ensure boolean (may be undefined before column added)
          }))
        )
      )
      .catch((err) => console.error("Failed to fetch tasks", err));
  }, []);

  // POST new task
  const handleAddTask = (text) => {
    const title = text.trim();
    if (!title) return;
    fetch(`${BACKEND_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }), // backend expects "title"
    })
      .then((res) => res.json())
      .then((newTask) =>
        setTasks((prev) => [
          ...prev,
          { ...newTask, text: newTask.title, completed: !!newTask.completed },
        ])
      )
      .catch((err) => console.error("❌ Failed to add task", err));
  };

  // DELETE task
  const handleDeleteTask = (id) => {
    fetch(`${BACKEND_URL}/tasks/${id}`, { method: "DELETE" })
      .then(() => setTasks((prev) => prev.filter((t) => t.id !== id)))
      .catch((err) => console.error("Failed to delete task", err));
  };

  // PATCH title (Edit)
  const handleUpdateTask = async (id, newTitle) => {
    const title = newTitle.trim();
    if (!title) return;
    const res = await fetch(`${BACKEND_URL}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const updated = await res.json();
    setTasks((ts) =>
      ts.map((t) =>
        t.id === id ? { ...updated, text: updated.title, completed: !!updated.completed } : t
      )
    );
  };

  // PATCH completed (checkbox)
  const handleToggleComplete = async (id, newCompleted) => {
    const res = await fetch(`${BACKEND_URL}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: newCompleted }),
    });
    const updated = await res.json();
    setTasks((ts) =>
      ts.map((t) => (t.id === id ? { ...t, completed: !!updated.completed } : t))
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <Header />
        <h1 className="text-3xl font-bold text-center text-blue-600">TaskFlow Dashboard</h1>
        <AddTask onAdd={handleAddTask} />

        <div className="flex items-center justify-between my-4">
          <div className="text-sm">
            {remaining} task{remaining !== 1 ? "s" : ""} left
          </div>
          <div className="flex gap-2">
            {["all", "active", "completed"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 border rounded ${filter === f ? "bg-black text-white" : ""}`}
              >
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <TaskList
          tasks={visible}
          onDelete={handleDeleteTask}
          onUpdate={handleUpdateTask}
          onToggleComplete={handleToggleComplete}
        />

      </div>
    </div>
  );
}
