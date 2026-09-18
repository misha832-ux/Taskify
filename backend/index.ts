import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

// Shape the frontend expects
interface Todo {
  id: number;
  todo: string;
  isDone: boolean;
  deadline: string;
}

// Map a Supabase row (snake_case) to the frontend's shape (camelCase)
const toTodo = (row: any): Todo => ({
  id: row.id,
  todo: row.todo,
  isDone: row.is_done,
  deadline: row.deadline || "",
});

// Get all todos
app.get("/api/todos", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(toTodo));
});

// Add a new todo (with a deadline)
app.post("/api/todos", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("todos")
    .insert({
      todo: req.body.todo,
      is_done: false,
      deadline: req.body.deadline || null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(toTodo(data));
});

// Delete a todo
app.delete("/api/todos/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Todo deleted successfully" });
});

// Toggle a todo's completed state
app.put("/api/todos/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const { data: existing, error: fetchError } = await supabase
    .from("todos")
    .select("is_done")
    .eq("id", id)
    .single();

  if (fetchError) return res.status(500).json({ error: fetchError.message });

  const { error } = await supabase
    .from("todos")
    .update({ is_done: !existing.is_done })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Todo updated successfully" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));