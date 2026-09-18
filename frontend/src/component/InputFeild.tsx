import React, { useRef } from "react"
import "./style.css"

interface Props {
    todo: string
    setTodo: React.Dispatch<React.SetStateAction<string>>
    deadline: string
    setDeadline: React.Dispatch<React.SetStateAction<string>>
    handleAdd: (e: React.FormEvent) => void
}

const InputFeild: React.FC<Props> = ({ todo, setTodo, deadline, setDeadline, handleAdd }) => {
    const inputRef = useRef<HTMLInputElement>(null)
    return (
        <form className='input' onSubmit={(e) => {
            handleAdd(e)
            inputRef.current?.blur()
        }}>
            <input
                ref={inputRef}
                type='text'
                value={todo}
                onChange={(e) => setTodo(e.target.value)}
                placeholder='Enter a task'
                className='input__box' />
            <input
                type='datetime-local'
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className='input__deadline' />
            <button className='input__submit' type='submit'>
                Go
            </button>
        </form>
    )
}

export default InputFeild