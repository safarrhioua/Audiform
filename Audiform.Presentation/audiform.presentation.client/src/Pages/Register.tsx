import React, { useState } from "react";

export default function Register() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Wachtwoorden komen niet overeen!");
            return;
        }
        setError("");
        console.log("Formulier is geldig!")
    }

    //return shows the content of the page
    return (
        <div>
            <h1>Registreren</h1>
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
                <input
                    type="password"
                    placeholder="herhaal wachtwoord"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="submit">  Registreren </button>
                {error && <p style={{ color: "red" }}>{error}</p> }
            </form>
        
        </div>
    );
}

