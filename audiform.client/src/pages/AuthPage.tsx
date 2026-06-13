import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "../Css/Auth.module.css";
import { API_URL } from "../utils/config";
import { usePageTitle } from "../hooks/UsePageTitle";
export default function AuthPage() {
    
    const [isLogin, setIsLogin] = useState(true);
    usePageTitle(
        isLogin
            ? "Inloggen"
            : "Registreren");
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [fullname, setFullname] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [userrole, setUserrole] = useState("");

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const confirmed = searchParams.get("confirmed") === "true";
    const loginRequired = searchParams.get("message") === "loginrequired";

    const [loginMessage, setLoginMessage] = useState(
        loginRequired
            ? "Log eerst in om deze pagina te bekijken."
            : confirmed
                ? "E-mail succesvol bevestigd! U kunt nu inloggen."
                : ""
    );

    const [registerMessage, setRegisterMessage] = useState("");

    const [isSuccess, setIsSuccess] = useState(confirmed);

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        
        e.preventDefault();

        setLoginMessage("");

        const response = await fetch(`${API_URL}/api/Auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                email: loginEmail,
                password: loginPassword,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            setIsSuccess(false);
            setLoginMessage(data.message || "Login mislukt");
            return;
        }

        localStorage.setItem("isLoggedIn", "true");

        setIsSuccess(true);
        setLoginMessage(data.message || "Login gelukt!");

        const role = data.role || data.Role;

        setTimeout(() => {
            if (role === "ShopEmployee") {
                navigate("/bestelpagina");
            } else if (role === "Employee") {
                navigate("/medewerkerportaal");
            } else {
                navigate("/authpage");
            }
        }, 1500);
    }

    async function handleResendConfirmation() {
        if (!loginEmail.trim()) {
            setIsSuccess(false);
            setLoginMessage("Voer eerst uw e-mailadres in.");
            return;
        }

        const response = await fetch(`${API_URL}/api/Auth/resend-confirmation`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginEmail),
        });

        const data = await response.json();

        setIsSuccess(response.ok);
        setLoginMessage(data.message || "Bevestigingsmail verwerkt.");
    }

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setRegisterMessage("");

        if (registerPassword !== confirmPassword) {
            setIsSuccess(false);
            setRegisterMessage("Wachtwoorden komen niet overeen!");
            return;
        }

        const response = await fetch(`${API_URL}/api/Auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                fullname,
                email: registerEmail,
                password: registerPassword,
                userrole,
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

    function switchToRegister() {
        setLoginEmail("");
        setLoginPassword("");
        setLoginMessage("");
        setIsLogin(false);
    }

    function switchToLogin() {
        setFullname("");
        setRegisterEmail("");
        setRegisterPassword("");
        setConfirmPassword("");
        setUserrole("");
        setRegisterMessage("");
        setIsLogin(true);
    }

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <div className={styles.formBox}>
                    {loginMessage && (
                        <p
                            className={
                                isSuccess
                                    ? styles.messageSuccess
                                    : styles.messageError
                            }
                        >
                            {loginMessage}
                        </p>
                    )}

                    <h1>Inloggen</h1>
                    <p>Vul uw gegevens in om in te loggen</p>

                    <form onSubmit={handleLogin}>
                        <label>E-mailadres</label>
                        <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                        />

                        <div className={styles.passwordHeader}>
                            <label>Wachtwoord</label>

                            <span
                                className={styles.forgotPassword}
                                onClick={() => navigate("/forgot-password")}
                            >
                                Vergeten?
                            </span>
                        </div>

                        <input
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                        />

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

                <div className={styles.formBox}>
                    <h1>Account aanmaken</h1>
                    <p>Vul uw gegevens in om te registreren</p>

                    {registerMessage && (
                        <p
                            className={
                                isSuccess
                                    ? styles.messageSuccess
                                    : styles.messageError
                            }
                        >
                            {registerMessage}
                        </p>
                    )}

                    <form onSubmit={handleRegister}>
                        <label>Volledige naam</label>
                        <input
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            required
                        />

                        <label>E-mailadres</label>
                        <input
                            type="email"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            required
                        />

                        <label>Rol</label>
                        <select
                            className={styles.selectInput}
                            value={userrole}
                            onChange={(e) => setUserrole(e.target.value)}
                            required
                        >
                            <option value="">Selecteer een rol</option>
                            <option value="ShopEmployee">Audicien</option>
                            <option value="Employee">Medewerker</option>
                        </select>

                        <label>Wachtwoord</label>
                        <input
                            type="password"
                            value={registerPassword}
                            onChange={(e) =>
                                setRegisterPassword(e.target.value)
                            }
                            required
                        />

                        <label>Bevestig wachtwoord</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            required
                        />

                        <button className={styles.darkBtn}>Registreren</button>
                    </form>
                </div>

                <div
                    className={`${styles.sliderPanel} ${isLogin ? styles.sliderRight : styles.sliderLeft
                        }`}
                >
                    <b className={styles.welkom}>Welkom!</b>

                    <div className={styles.logo}>
                        <span>AUDI</span>FORM
                    </div>

                    {isLogin ? (
                        <>
                            <p>Heeft u nog geen account?</p>
                            <button
                                className={styles.outlineBtn}
                                onClick={switchToRegister}
                            >
                                Registreren
                            </button>
                        </>
                    ) : (
                        <>
                            <p>Heeft u al een account?</p>
                            <button
                                className={styles.whiteBtn}
                                onClick={switchToLogin}
                            >
                                Inloggen
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}