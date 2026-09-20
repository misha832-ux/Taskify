import React, { useState, useEffect, useRef } from 'react'
import type { Session } from '@supabase/supabase-js'
import './App.css'
import InputFeild from './component/InputFeild'
import { type Todo } from "./model"
import TodoList from './component/TodoList'
import Auth from './component/Auth'
import { supabase } from './supabaseClient'

// In production, set VITE_API_URL to your deployed backend's URL.
// Falls back to localhost so local dev keeps working unchanged.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const App: React.FC = () => {

    const [todo, setTodo] = useState<string>("")
    const [deadline, setDeadline] = useState<string>("")
    const [todos, setTodos] = useState<Todo[]>([])
    const [session, setSession] = useState<Session | null>(null)
    const [authLoading, setAuthLoading] = useState(true)
    const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
        typeof Notification !== "undefined" ? Notification.permission : "denied"
    )
    // Remembers which "soon"/"overdue" alerts already fired, so we don't repeat them every check
    const notifiedRef = useRef<Set<string>>(new Set())

    // Track login state
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            setAuthLoading(false)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession)
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    const authHeaders = (): Record<string, string> => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
    })

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()

        if (todo) {
            try {
                // The datetime-local input gives a naive local time with no timezone
                // (e.g. "2026-09-20T14:20"). Converting it to an ISO string here
                // captures it as an explicit UTC instant, so it's stored and
                // displayed correctly regardless of timezone.
                const deadlineISO = deadline ? new Date(deadline).toISOString() : ""

                const res = await fetch(`${API_URL}/api/todos`, {
                    method: "POST",
                    headers: authHeaders(),
                    body: JSON.stringify({ todo, deadline: deadlineISO })
                })
                const newTodo = await res.json()
                setTodos([...todos, newTodo])
                setTodo("")
                setDeadline("")
            } catch (err) {
                console.log(err)
            }
        }
    }

    const handleToggle = async (id: number) => {
        try {
            await fetch(`${API_URL}/api/todos/${id}`, {
                method: "PUT",
                headers: authHeaders(),
            })
            setTodos(todos.map(t => t.id === id ? { ...t, isDone: !t.isDone } : t))
        } catch (err) {
            console.log(err)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await fetch(`${API_URL}/api/todos/${id}`, {
                method: "DELETE",
                headers: authHeaders(),
            })
            setTodos(todos.filter(t => t.id !== id))
        } catch (err) {
            console.log(err)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setTodos([])
    }

    // Fetch todos once we know who's logged in
    useEffect(() => {
        if (!session) return
        fetch(`${API_URL}/api/todos`, { headers: authHeaders() })
            .then(res => res.json())
            .then(data => setTodos(data))
    }, [session])

    const requestNotifPermission = async () => {
        if (typeof Notification === "undefined") return
        const result = await Notification.requestPermission()
        setNotifPermission(result)
    }

    // Checks every 30s for tasks that just became "due soon" or "overdue"
    // and fires a real browser notification for each, once.
    useEffect(() => {
        if (notifPermission !== "granted") return

        const checkDeadlines = () => {
            const now = Date.now()

            todos.forEach(t => {
                if (t.isDone || !t.deadline) return
                const diff = new Date(t.deadline).getTime() - now

                if (diff <= 0) {
                    const key = `${t.id}-overdue`
                    if (!notifiedRef.current.has(key)) {
                        notifiedRef.current.add(key)
                        new Notification("Task overdue", { body: t.todo })
                    }
                } else if (diff <= 24 * 60 * 60 * 1000) {
                    const key = `${t.id}-soon`
                    if (!notifiedRef.current.has(key)) {
                        notifiedRef.current.add(key)
                        new Notification("Due within 24 hours", { body: t.todo })
                    }
                }
            })
        }

        checkDeadlines()
        const interval = setInterval(checkDeadlines, 30000)
        return () => clearInterval(interval)
    }, [todos, notifPermission])

    if (authLoading) return null
    if (!session) return <Auth />

    return (
        <div className="App">
            <span className="heading">Taskify</span>
            {session.user.user_metadata?.full_name && (
                <span className="greeting">Hi, {session.user.user_metadata.full_name} 👋</span>
            )}
            <InputFeild
                todo={todo}
                setTodo={setTodo}
                deadline={deadline}
                setDeadline={setDeadline}
                handleAdd={handleAdd}
            />
            <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
            {notifPermission !== "granted" && (
                <button className="reminders" onClick={requestNotifPermission}>
                    🔔 Enable deadline reminders
                </button>
            )}
            <button className="logout" onClick={handleLogout}>Log out</button>
        </div>
    )
}

export default App