import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Css/Auth.module.css";

export default function Register() {
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Wachtwoorden komen niet overeen!");
            setSuccess("");
            return;
        }

        setError("");
        setSuccess("");

        try {
            const response = await fetch("https://localhost:7050/api/Auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    firstName: fullname,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registratie mislukt!");
                return;
            }

            setSuccess("Registratie is gelukt! Controleer uw e-mail.");
        } catch (error) {
            console.error(error);
            setError("Er is iets misgegaan");
        }
    }

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <div className={styles.authSide}>
                    <b className={styles.welkom}>Welkom!</b>

                    <div className={styles.logo}>
                        <span>AUDI</span>FORM
                    </div>

                    <p>Heeft u al een account?</p>

                    <Link to="/login" className={styles.whiteBtn}>
                        Inloggen
                    </Link>
                </div>

                <div className={styles.authForm}>
                    <h1>Account aanmaken</h1>
                    <p>Vul uw gegevens in om te registreren</p>

                    <form onSubmit={handleSubmit}>
                        <label>Volledige naam</label>
                        <input
                            type="text"
                            placeholder="Jan Jansen"
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            required
                        />

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
                            placeholder="Maak een wachtwoord"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <label>Bevestig wachtwoord</label>
                        <input
                            type="password"
                            placeholder="Bevestig uw wachtwoord"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <button type="submit" className={styles.darkBtn}>
                            Registreren
                        </button>
                    </form>

                    {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
                    {success && <p style={{ color: "green", marginTop: "15px" }}>{success}</p>}
                </div>
            </div>
        </div>
    );
}