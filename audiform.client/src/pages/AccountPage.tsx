import { useEffect, useState } from "react";
import styles from "../Css/AccountPage.module.css";

export default function AccountPage() {
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function fetchProfile() {
            const response = await fetch("https://localhost:7050/api/UserManagement/GetUser", {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) return;

            const data = await response.json();

            setFullname(data.fullname || "");
            setEmail(data.email || "");
            setPhoneNumber(data.phoneNumber || "");
            setBirthDate(data.dateofbirth || "");
        }

        fetchProfile();
    }, []);

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        const response = await fetch("https://localhost:7050/api/UserManagement/updateprofile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                fullname,
                email,
                phoneNumber,
                dateofbirth: birthDate,
            }),
        });

        const text = await response.text();

        if (!response.ok) {
            setMessage(text || "Profiel bijwerken mislukt.");
            return;
        }

        setMessage(text || "Profiel succesvol bijgewerkt.");
    }

    return (
        <main className={styles.accountPage}>
            <button className={styles.backButton}>← Terug naar startpagina</button>

            <h1>Account</h1>
            <p className={styles.subtitle}>Beheer uw persoonlijke gegevens en voorkeuren</p>

            <div className={styles.tabs}>
                <button className={styles.activeTab}>Persoonlijke gegevens</button>
                <button className={styles.tab}>Adressen</button>
            </div>

            <section className={styles.accountCard}>
                <form onSubmit={handleSave}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Volledige naam</label>
                            <input
                                value={fullname}
                                onChange={(e) => setFullname(e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>E-mailadres</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Telefoonnummer</label>
                            <input
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Geboortedatum</label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {message && <p className={styles.message}>{message}</p>}

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelButton}>
                            Annuleren
                        </button>

                        <button type="submit" className={styles.saveButton}>
                            Opslaan
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}