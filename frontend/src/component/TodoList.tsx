import React, { useEffect, useState } from 'react'
import "./style.css"
import type { Todo } from '../model'

interface Props {
    todos: Todo[]
    onToggle: (id: number) => void
    onDelete: (id: number) => void
}

// Works out how urgent a task is based on its deadline
const getUrgency = (deadline: string): { label: string; className: string } => {
    if (!deadline) return { label: "No deadline", className: "urgency-none" }

    const diff = new Date(deadline).getTime() - Date.now()

    if (diff <= 0) return { label: "Overdue", className: "urgency-overdue" }
    if (diff <= 24 * 60 * 60 * 1000) return { label: "Due soon", className: "urgency-soon" }
    return { label: "Plenty of time", className: "urgency-ok" }
}

const formatDeadline = (deadline: string): string => {
    if (!deadline) return ""
    return new Date(deadline).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
}

const TodoList: React.FC<Props> = ({ todos, onToggle, onDelete }) => {
    // re-render every 30s so urgency badges stay live
    const [, setTick] = useState(0)
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 30000)
        return () => clearInterval(interval)
    }, [])

    const [burstAt, setBurstAt] = useState<{ x: number; y: number; key: number } | null>(null)

    const handleCheck = (e: React.MouseEvent, id: number, isDone: boolean) => {
        if (!isDone) {
            const rect = (e.target as HTMLElement).getBoundingClientRect()
            setBurstAt({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, key: Date.now() })
            setTimeout(() => setBurstAt(null), 700)
        }
        onToggle(id)
    }

    return (
        <div className="todos">
            {todos.length === 0 && <p className="todos__empty">No tasks yet — add one above!</p>}
            {todos.map(todo => {
                const urgency = todo.isDone ? { label: "Done", className: "urgency-done" } : getUrgency(todo.deadline)
                return (
                    <div className={`todos__single ${todo.isDone ? "todos__single--done" : ""}`} key={todo.id}>
                        <input
                            type="checkbox"
                            checked={todo.isDone}
                            onClick={(e) => handleCheck(e, todo.id, todo.isDone)}
                            onChange={() => {}}
                            className="todos__checkbox"
                        />
                        <div className="todos__body">
                            <span className="todos__text">{todo.todo}</span>
                            {todo.deadline && (
                                <span className="todos__deadline">{formatDeadline(todo.deadline)}</span>
                            )}
                        </div>
                        <span className={`urgency-badge ${urgency.className}`}>{urgency.label}</span>
                        <span className="icon" onClick={() => onDelete(todo.id)}>🗑️</span>
                    </div>
                )
            })}

            {burstAt && (
                <div className="confetti-burst" style={{ left: burstAt.x, top: burstAt.y }} key={burstAt.key}>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <span
                            key={i}
                            className="confetti-piece"
                            style={{
                                "--angle": `${(360 / 12) * i}deg`,
                                background: ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"][i % 5]
                            } as React.CSSProperties}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default TodoList
