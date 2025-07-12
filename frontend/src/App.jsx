import { useState, useEffect } from "react";
import Header from './components/Header';
import TaskList from './components/TaskList';
import AddTask from './components/AddTask';

function App() {
  const [tasks, setTasks] = useState([]);
  const BACKEND_URL = "http://127.0.0.1:5000";

  // GET tasks on load
  useEffect(() => {
    fetch(`${BACKEND_URL}/tasks`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("Failed to fetch tasks", err));
  }, []);

  // POST new task
  const handleAddTask = (text) => {
console.log("📤 Sending task:", text);
  fetch(`${BACKEND_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  })
    .then((res) => res.json())
    .then((newTask) => {
      console.log("✅ Task added from backend:", newTask);
      setTasks((prev) => [...prev, newTask]);
    })
    .catch((err) => console.error("❌ Failed to add task", err));

  };

  // DELETE task
  const handleDeleteTask = (id) => {
    fetch(`${BACKEND_URL}/tasks/${id}`, {
      method: "DELETE",
    })
      .then(() => setTasks((prev) => prev.filter((task) => task.id !== id)))
      .catch((err) => console.error("Failed to delete task", err));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <Header />
        <h1 className="text-3xl font-bold text-center text-blue-600">
          TaskFlow Dashboard
        </h1>
        <AddTask onAdd={handleAddTask} />
        <TaskList tasks={tasks} onDelete={handleDeleteTask} />
      </div>
    </div>
  );
}

export default App;
