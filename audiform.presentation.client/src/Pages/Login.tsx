import { useState } from "react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("https://localhost:7257/api/Auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Login succesvol!");
                console.log(data);

                // hier kun je later redirecten
                // navigate("/dashboard");
            } else {
                setMessage(data.message || "Login mislukt");
            }
        } catch (error) {
            console.error(error);
            setMessage("Server fout");
        }
    };

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleLogin}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label>Wachtwoord</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit">
                    Inloggen
                </button>
            </form>

            <p>{message}</p>
        </div>
    );
}

export default Login;