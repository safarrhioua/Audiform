import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import styles from "../Css/Auth.module.css";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(false);

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [fullname, setFullname] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [searchParams] = useSearchParams();
    const confirmed = searchParams.get("confirmed") === "true";
    const [loginMessage, setLoginMessage] = useState(
        confirmed ? "E-mail succesvol bevestigd! U kunt nu inloggen." : ""
    );
    const [registerMessage, setRegisterMessage] = useState("");  
    const [isSuccess, setIsSuccess] = useState(confirmed);
    const navigate = useNavigate();
   

    
    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoginMessage("");

        const response = await fetch("https://localhost:7050/api/Auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                email: loginEmail,
                password: loginPassword,
            }),
        });

        const text = await response.text();

        if (!response.ok) {
            setIsSuccess(false);
            setLoginMessage(text || "Login mislukt");
            return;
        }

        setIsSuccess(true);
        setLoginMessage(text || "Login gelukt!");

        setTimeout(() => {
            navigate("/dashboard");
        }, 1500);
       
    }
    async function handleResendConfirmation() {

        if (!loginEmail) {
            setLoginMessage("Voer eerst uw e-mailadres in.");
            return;
        }

        const response = await fetch(
            "https://localhost:7050/api/Auth/resend-confirmation",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(loginEmail),
            }
        );

        const data = await response.json();

        setIsSuccess(response.ok);

        setLoginMessage(data.message);
    }

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setRegisterMessage("");

        if (registerPassword !== confirmPassword) {
            setRegisterMessage("Wachtwoorden komen niet overeen!");
            return;
        }

        const response = await fetch("https://localhost:7050/api/Auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                fullname: fullname,
                email: registerEmail,
                password: registerPassword,
            }),
        });

        const text = await response.text();

        if (!response.ok) {
            setIsSuccess(false);
            setRegisterMessage(text || "Registratie mislukt");
            return;
        }
        setIsSuccess(true);
        setRegisterMessage(text || "Registratie gelukt! Controleer uw e-mail.");
    }

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <div className={styles.formBox}>
                    <h1>Account aanmaken</h1>
                    <p>Vul uw gegevens in om te registreren</p>
                    {registerMessage && (
                        <p className={isSuccess ? styles.messageSuccess : styles.messageError}>
                            {registerMessage}
                        </p>
                    )}
                    <form onSubmit={handleRegister}>
                        <label>Volledige naam</label>
                        <input value={fullname} onChange={(e) => setFullname(e.target.value)} required />

                        <label>E-mailadres</label>
                        <input type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />

                        <label>Wachtwoord</label>
                        <input type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required />

                        <label>Bevestig wachtwoord</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

                        <button className={styles.darkBtn}>Registreren</button>
                    </form>
                    
                </div>
               
                <div className={styles.formBox}>
                    {loginMessage && (
                        <p className={isSuccess ? styles.messageSuccess : styles.messageError}>
                            {loginMessage}
                        </p>
                    )}
                    <h1>Inloggen</h1>
                    <p>Vul uw gegevens in om in te loggen</p>

                    <form onSubmit={handleLogin}>
                        <label>E-mailadres</label>
                        <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />

                        <label>Wachtwoord</label>
                        <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />

                        <button className={styles.darkBtn}>Inloggen</button>
                        <button
                            type="button"
                            className={styles.linkBtn}
                            onClick={handleResendConfirmation}
                        >
                            Bevestigingsmail opnieuw versturen
                        </button>
                    </form>

                    
                </div>

                <div className={`${styles.sliderPanel} ${isLogin ? styles.sliderRight : styles.sliderLeft}`}>
                    <b className={styles.welkom}>Welkom!</b>

                    <div className={styles.logo}>
                        <span>AUDI</span>FORM
                    </div>

                    {isLogin ? (
                        <>
                            <p>Heeft u al geen account?</p>
                            <button className={styles.outlineBtn} onClick={() => setIsLogin(false)}>
                                Inloggen
                            </button>
                        </>
                    ) : (
                        <>
                            <p>Heeft u nog geen account?</p>
                            <button className={styles.whiteBtn} onClick={() => setIsLogin(true)}>
                                Maak een account
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
        
    );
    
}
