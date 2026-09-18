import React, { useState, useEffect } from 'react'
import './App.css'
import InputFeild from './component/InputFeild'
import { type Todo } from "./model"
import TodoList from './component/TodoList'

const App: React.FC = () => {

    const [todo, setTodo] = useState<string>("")
    const [deadline, setDeadline] = useState<string>("")
    const [todos, setTodos] = useState<Todo[]>([])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()

        if (todo) {
            try {
                const res = await fetch("http://localhost:5000/api/todos", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
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
                method: "PUT"
            })
            setTodos(todos.map(t => t.id === id ? { ...t, isDone: !t.isDone } : t))
        } catch (err) {
            console.log(err)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await fetch(`http://localhost:5000/api/todos/${id}`, {
                method: "DELETE"
            })
            setTodos(todos.filter(t => t.id !== id))
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        fetch("http://localhost:5000/api/todos")
            .then(res => res.json())
            .then(data => setTodos(data))
    }, [])

    return (
        <div className="App">
            <span className="heading">Taskify</span>
            <InputFeild
                todo={todo}
                setTodo={setTodo}
                deadline={deadline}
                setDeadline={setDeadline}
                handleAdd={handleAdd}
            />
            <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
        </div>
    )
}

export default App
