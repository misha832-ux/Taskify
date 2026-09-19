import express, { Request, Response, NextFunction } from "express";
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

// Extend Express's Request type to carry the authenticated user
interface AuthedRequest extends Request {
  userId?: string;
}

// Verifies the Supabase access token sent from the frontend and
// attaches the user's id to the request. Every /api/todos route needs this.
const requireAuth = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization; // "Bearer <token>"
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  req.userId = data.user.id;
  next();
};

// Get all todos belonging to the logged-in user
app.get("/api/todos", requireAuth, async (req: AuthedRequest, res: Response) => {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", req.userId)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(toTodo));
});

// Add a new todo (with a deadline), owned by the logged-in user
app.post("/api/todos", requireAuth, async (req: AuthedRequest, res: Response) => {
  const { data, error } = await supabase
    .from("todos")
    .insert({
      todo: req.body.todo,
      is_done: false,
      deadline: req.body.deadline || null,
      user_id: req.userId,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(toTodo(data));
});

// Delete a todo (only if it belongs to the logged-in user)
app.delete("/api/todos/:id", requireAuth, async (req: AuthedRequest, res: Response) => {
  const id = Number(req.params.id);
  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", req.userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Todo deleted successfully" });
});

// Toggle a todo's completed state (only if it belongs to the logged-in user)
app.put("/api/todos/:id", requireAuth, async (req: AuthedRequest, res: Response) => {
  const id = Number(req.params.id);

  const { data: existing, error: fetchError } = await supabase
    .from("todos")
    .select("is_done")
    .eq("id", id)
    .eq("user_id", req.userId)
    .single();

  if (fetchError) return res.status(500).json({ error: fetchError.message });

  const { error } = await supabase
    .from("todos")
    .update({ is_done: !existing.is_done })
    .eq("id", id)
    .eq("user_id", req.userId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Todo updated successfully" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));