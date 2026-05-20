import React, { useState } from "react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        //if (password) {
        //    setError("Wachtwoorden komen niet overeen!");
        //    setSuccess("");
        //    return;
        //}

        //setError("");
        //setSuccess("");

        try {
            const response = await fetch("https://localhost:7257/api/Auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || "Inloggen mislukt!");
                return;
            }

            setSuccess("Inloggen is gelukt!");
        } catch {
            setError("Er is iets misgegaan");
        }
    }

    return (
        <div>
            <h1>Inloggen</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Wachtwoord"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {/*<input*/}
                {/*    type="password"*/}
                {/*    placeholder="Herhaal wachtwoord"*/}
                {/*    value={confirmPassword}*/}
                {/*    onChange={(e) => setConfirmPassword(e.target.value)}*/}
                {/*/>*/}
                <button type="submit">Inloggen</button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
        </div>
    );
}
