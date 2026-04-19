// import { useEffect, useState } from "react";

// // Types for API responses
// type TestResponse = {
//   message: string;
// };

// type User = {
//   id: number;       // or string, depending on your backend
//   name: string;
// };

// function App() {
//   const [message, setMessage] = useState<string>("");
//   const [users, setUsers] = useState<User[]>([]);
//   const [loadingMessage, setLoadingMessage] = useState(true);
//   const [loadingUsers, setLoadingUsers] = useState(true);

//   // Fetch /api/test
//   useEffect(() => {
//     fetch("http://localhost:5000/api/test")
//       .then((res) => res.json())
//       .then((data: TestResponse) => {
//         setMessage(data.message);
//         setLoadingMessage(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching message:", err);
//         setLoadingMessage(false);
//       });
//   }, []);

//   // Fetch /api/users
//   useEffect(() => {
//     fetch("http://localhost:5000/api/users")
//       .then((res) => res.json())
//       .then((data: User[]) => {
//         setUsers(data);
//         setLoadingUsers(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching users:", err);
//         setLoadingUsers(false);
//       });
//   }, []);

//   return (
//     <div style={{ fontFamily: "sans-serif", textAlign: "center", marginTop: "40px" }}>
//       <h1>React + Express (TypeScript)</h1>

//       {/* Display /api/test message */}
//       <p>{loadingMessage ? "Connecting..." : message}</p>

//       {/* Display /api/users list */}
//       <h2>Users</h2>
//       {loadingUsers ? (
//         <p>Loading users...</p>
//       ) : (
//         <ul>
//           {users.map((user) => (
//             <li key={user.id}>{user.name}</li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

// export default App;



import React, { useState, useEffect } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import InputFeild from './component/InputFeild'
import { type Todo } from "./model"
import TodoList from './component/TodoList'


const App: React.FC = () => {

    const [todo, setTodo] = useState<string>("")
    const [todos, setTodos] = useState<Todo[]>([])

    const handleAdd = async (e: React.FormEvent) => {
       e.preventDefault()

       if (todo){
        try{
          const res = await fetch("http://localhost:5000/api/todos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ todo, deadline: "" }) // You can replace "" with the actual deadline value if you have it in your state
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
    const getRemainingTime = (deadline: string) => {
    const now = new Date().getTime();
    const end = new Date(deadline).getTime();

    const diff = end - now;

    if (diff <= 0) return "⛔ Time's up";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return `${hours}h ${minutes}m left`;
    };

    useEffect(() => {
      fetch("http://localhost:5000/api/todos")
        .then(res => res.json())
        .then(data => setTodos(data))
    }, [])

    console.log(todo)

    return (
      <div className="App">
          <span className="heading">Taskify</span>
          <InputFeild todo={todo} setTodo={setTodo} handleAdd={handleAdd}/>
          <TodoList todos={todos} setTodos={setTodos}/>
      </div>
    )
}

export default App

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

