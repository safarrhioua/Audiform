import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../Css/Auth.module.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        try {
            const response = await fetch("https://localhost:7050/api/Auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Login mislukt");
                return;
            }

            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            setMessage("Server fout");
        }
    }

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <div className={styles.authForm}>
                    <h1>Inloggen</h1>
                    <p>Vul uw gegevens in om in te loggen</p>

                    <form onSubmit={handleLogin}>
                        <label>E-mailadres</label>
                        <input
                            type="email"
                            placeholder="naam@voorbeeld.nl"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label>Wachtwoord</label>
                        <input
                            type="password"
                            placeholder="Voer uw wachtwoord in"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button type="submit" className={styles.darkBtn}>
                            Inloggen
                        </button>
                    </form>

                    {message && (
                        <p style={{ color: "red", marginTop: "15px" }}>{message}</p>
                    )}
                </div>

                <div className={styles.authSide}>
                    <b className={styles.welkom}>Welkom!</b>

                    <div className={styles.logo}>
                        <span>AUDI</span>FORM
                    </div>

                    <p>Heeft u nog geen account?</p>

                    <Link to="/register" className={styles.outlineBtn}>
                        Maak een account
                    </Link>
                </div>
            </div>
        </div>
    );
}