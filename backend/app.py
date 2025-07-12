from flask import Flask, jsonify, request
from supabase import create_client, Client
from flask_cors import CORS


SUPABASE_URL = "https://ucdwkpzzqfrhxrxmyulq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZHdrcHp6cWZyaHhyeG15dWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NDk4OTAsImV4cCI6MjA2NzUyNTg5MH0.Ww7dRHVCFr0VL_KeHR3jXQwU6W7OEoYUeBujQktUv9w"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Welcome to the TaskFlow backend!"


@app.route("/ping")
def ping():
    return "Pong from Flask!"

@app.route("/tasks", methods=["GET"])
def get_tasks():
    response = supabase.table("tasks").select("*").order("id", desc=False).execute()
    return jsonify(response.data)

@app.route("/tasks", methods=["POST"])
def add_task():
    data = request.get_json()
    print("📦 Received data from frontend:", data)  # <-- this will print in terminal
    response = supabase.table("tasks").insert({"text": data["text"]}).execute()
    print("✅ Insert result:", response.data)  # <-- did it actually save?
    return jsonify(response.data[0]), 201



@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    try:
        supabase.table("tasks").delete().eq("id", task_id).execute()
        return jsonify({"message": "Task deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
