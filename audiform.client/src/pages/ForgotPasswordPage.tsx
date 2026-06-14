import { useState } from "react";
import { API_URL } from "../utils/config";
import styles from "../Css/Auth.module.css";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/Auth/Forgot-Password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const text = await response.text();

            setIsSuccess(response.ok);
            setMessage(text || "Als dit e-mailadres bestaat, is er een resetlink verstuurd.");
        } catch {
            setIsSuccess(false);
            setMessage("Er ging iets mis. Probeer het opnieuw.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={styles.authPage}>
            <div className={styles.formBox}>
                <h1>Wachtwoord vergeten</h1>
                <p>Vul uw e-mailadres in om een resetlink te ontvangen.</p>

                {message && (
                    <p className={isSuccess ? styles.messageSuccess : styles.messageError}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <label>E-mailadres</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button className={styles.darkBtn} disabled={isLoading}>
                        {isLoading ? "Versturen..." : "Resetlink versturen"}
                    </button>
                </form>
            </div>
        </div>
    );
}