import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_URL } from "../utils/config";
import styles from "../Css/Auth.module.css";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const email = searchParams.get("email") || "";
    const token = searchParams.get("token") || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        if (newPassword !== confirmPassword) {
            setIsSuccess(false);
            setMessage("Wachtwoorden komen niet overeen.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/Auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    token,
                    newPassword,
                }),
            });

            const text = await response.text();

            if (!response.ok) {
                setIsSuccess(false);
                setMessage(text || "Wachtwoord resetten mislukt.");
                return;
            }

            setIsSuccess(true);
            setMessage(text || "Wachtwoord succesvol gewijzigd.");

            setTimeout(() => {
                navigate("/login");
            }, 1500);
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
                <h1>Nieuw wachtwoord instellen</h1>

                {message && (
                    <p className={isSuccess ? styles.messageSuccess : styles.messageError}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <label>Nieuw wachtwoord</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />

                    <label>Bevestig wachtwoord</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <button className={styles.darkBtn} disabled={isLoading}>
                        {isLoading ? "Opslaan..." : "Wachtwoord wijzigen"}
                    </button>
                </form>
            </div>
        </div>
    );
} 