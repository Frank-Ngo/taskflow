from flask import Flask, jsonify, request
from supabase import create_client, Client
from flask_cors import CORS


from dotenv import load_dotenv
import os

load_dotenv()  # load from .env

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_KEY in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
CORS(app)

def supa_ok(resp):
    """Raise an exception if Supabase returned an error-like response."""
    # python-supabase returns .data and .error (None on success)
    if getattr(resp, "error", None):
        raise RuntimeError(str(resp.error))
    return resp.data

@app.route("/")
def home():
    return "Welcome to the TaskFlow backend!"


@app.route("/ping")
def ping():
    return "Pong from Flask!"

@app.route("/tasks", methods=["GET"])
def get_tasks():
    try:
        data = supa_ok(supabase.table("tasks").select("*").order("id", desc=False).execute())
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/tasks", methods=["POST"])
def add_task():
    try:
        payload = request.get_json() or {}
        title = (payload.get("title") or "").strip()
        if not title:
            return jsonify({"error": "Title cannot be empty"}), 400

        data = supa_ok(supabase.table("tasks").insert({"title": title}).execute())
        # data is a list with the inserted row
        return jsonify(data[0]), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/tasks/<int:task_id>", methods=["PATCH"])
def update_task(task_id):
    try:
        payload = request.get_json() or {}
        patch = {}

        # Allow updating these fields. Your current table has only "title",
        # but this keeps it future-proof if you add more columns later.
        if "title" in payload:
            title = (payload.get("title") or "").strip()
            if not title:
                return jsonify({"error": "Title cannot be empty"}), 400
            patch["title"] = title

        # NEW: allow completed (plus future fields you might add)
        for k in ("completed", "status", "priority", "due_date"):
            if k in payload:
                patch[k] = payload[k]

        if not patch:
            return jsonify({"error": "No valid fields to update"}), 400

        data = supa_ok(supabase.table("tasks").update(patch).eq("id", task_id).execute())
        if not data:
            return jsonify({"error": "Task not found"}), 404
        return jsonify(data[0]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    try:
        supa_ok(supabase.table("tasks").delete().eq("id", task_id).execute())
        return jsonify({"message": "Task deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)