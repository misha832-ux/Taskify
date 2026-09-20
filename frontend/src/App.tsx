import React, { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import './App.css'
import InputFeild from './component/InputFeild'
import { type Todo } from "./model"
import TodoList from './component/TodoList'
import Auth from './component/Auth'
import { supabase } from './supabaseClient'

const App: React.FC = () => {

    const [todo, setTodo] = useState<string>("")
    const [deadline, setDeadline] = useState<string>("")
    const [todos, setTodos] = useState<Todo[]>([])
    const [session, setSession] = useState<Session | null>(null)
    const [authLoading, setAuthLoading] = useState(true)

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
                const res = await fetch("http://localhost:5000/api/todos", {
                    method: "POST",
                    headers: authHeaders(),
                    body: JSON.stringify({ todo, deadline })
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
            await fetch(`http://localhost:5000/api/todos/${id}`, {
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
            await fetch(`http://localhost:5000/api/todos/${id}`, {
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
        fetch("http://localhost:5000/api/todos", { headers: authHeaders() })
            .then(res => res.json())
            .then(data => setTodos(data))
    }, [session])

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
            <button className="logout" onClick={handleLogout}>Log out</button>
        </div>
    )
}

export default App