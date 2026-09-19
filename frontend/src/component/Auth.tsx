import React, { useState } from "react"
import { supabase } from "../supabaseClient"
import "./auth.css"

const Auth: React.FC = () => {
    const [mode, setMode] = useState<"login" | "signup">("login")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setMessage("")
        setLoading(true)

        if (mode === "login") {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) setError(error.message)
        } else {
            const { error } = await supabase.auth.signUp({ email, password })
            if (error) {
                setError(error.message)
            } else {
                setMessage("Check your email to confirm your account, then log in.")
            }
        }

        setLoading(false)
    }

    return (
        <div className="auth">
            <div className="auth__card">
                <h1 className="auth__title">Taskify</h1>
                <p className="auth__subtitle">
                    {mode === "login" ? "Log in to see your tasks" : "Create an account to get started"}
                </p>

                <form onSubmit={handleSubmit} className="auth__form">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="auth__input"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="auth__input"
                    />

                    {error && <p className="auth__error">{error}</p>}
                    {message && <p className="auth__message">{message}</p>}

                    <button type="submit" disabled={loading} className="auth__submit">
                        {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
                    </button>
                </form>

                <p className="auth__switch">
                    {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
                    <span
                        onClick={() => {
                            setMode(mode === "login" ? "signup" : "login")
                            setError("")
                            setMessage("")
                        }}
                    >
                        {mode === "login" ? "Sign up" : "Log in"}
                    </span>
                </p>
            </div>
        </div>
    )
}

export default Auth