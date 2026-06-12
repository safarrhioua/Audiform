import { useEffect, useState } from "react";
import styles from "../Css/AccountPage.module.css";
import { getErrorMessage } from "../hooks/ApiHelper";

type Address = {
    straat: string;
    postcode: string;
    stad: string;
    land: string;
};

const emptyAddress: Address = {
    straat: "",
    postcode: "",
    stad: "",
    land: ""
};

export default function AccountPage() {
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("personal");

    const [billingAdress, setBillingAddress] = useState<Address>(emptyAddress);
    const [shippingAdress, setShippingAddress] = useState<Address>(emptyAddress);

    const [editingBilling, setEditingBilling] = useState(false);
    const [editingShipping, setEditingShipping] = useState(false);

    async function fetchAddress(
        addressType: "Billing" | "Shipping",
        setAddress: React.Dispatch<React.SetStateAction<Address>>
    ) {
        const response = await fetch(
            `https://localhost:7050/api/Adress/GetAdres/${addressType}`,
            {
                method: "GET",
                credentials: "include",
            }
        );

        if (!response.ok) return;

        const result = await response.json();

        if (!result.success || !result.data) return;

        setAddress({
            straat: result.data.straat || "",
            postcode: result.data.postcode || "",
            stad: result.data.stad || "",
            land: result.data.land || "",
        });
    }

    useEffect(() => {
        async function fetchProfile() {
            const response = await fetch(
                "https://localhost:7050/api/UserManagement/GetUser",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (!response.ok) return;

            const data = await response.json();

            setFullname(data.fullname || "");
            setEmail(data.email || "");
            setPhoneNumber(data.phoneNumber || "");
            setBirthDate(data.dateofbirth || "");
        }

        fetchProfile();
        fetchAddress("Billing", setBillingAddress);
        fetchAddress("Shipping", setShippingAddress);
    }, []);

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        const response = await fetch(
            "https://localhost:7050/api/UserManagement/updateprofile",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    fullname,
                    email,
                    phoneNumber,
                    dateofbirth: birthDate,
                }),
            }
        );

        if (!response.ok) {
            const errorMessage = await getErrorMessage(
                response,
                "Profiel bijwerken mislukt."
            );

            setMessage(errorMessage);
            return;
        }

        const text = await response.text();
        setMessage(text || "Profiel succesvol bijgewerkt.");
    }

    async function handleSaveAddresses() {
        setMessage("");

        const response = await fetch(
            "https://localhost:7050/api/Adress/save-adresses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    billingAdress: billingAdress,
                    shippingAdress: shippingAdress,
                }),
            }
        );

        if (!response.ok) {
            const errorMessage = await getErrorMessage(
                response,
                "Adressen opslaan mislukt."
            );

            setMessage(errorMessage);
            return;
        }

        const text = await response.text();

        setEditingBilling(false);
        setEditingShipping(false);
        setMessage(text || "Adressen succesvol opgeslagen.");
    }

    function renderAddressCard(
        title: string,
        address: Address,
        isEditing: boolean,
        setIsEditing: (value: boolean) => void,
        setAddress: React.Dispatch<React.SetStateAction<Address>>
    ) {
        const hasAddress =
            address.straat.trim() !== "" ||
            address.postcode.trim() !== "" ||
            address.stad.trim() !== "" ||
            address.land.trim() !== "";

        return (
            <div className={styles.addressCard}>
                <div className={styles.addressActions}>
                    <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? "Sluiten" : hasAddress ? "Bewerken" : "Nieuw"}
                    </button>
                </div>

                <div className={styles.addressTitle}>{title}</div>

                {!isEditing ? (
                    <>
                        <div className={styles.addressSummary}>
                            {hasAddress
                                ? `${address.straat}, ${address.postcode} ${address.stad}`
                                : "Geen adres opgeslagen"}
                        </div>

                        <div className={styles.addressText}>
                            {hasAddress ? (
                                <>
                                    {address.straat}
                                    <br />
                                    {address.postcode} {address.stad}
                                    <br />
                                    {address.land}
                                </>
                            ) : (
                                "Klik op Nieuw om een adres toe te voegen."
                            )}
                        </div>
                    </>
                ) : (
                    <div className={styles.addressForm}>
                        <input
                            placeholder="Straat"
                            value={address.straat}
                            onChange={(e) =>
                                setAddress({
                                    ...address,
                                    straat: e.target.value,
                                })
                            }
                        />

                        <input
                            placeholder="Postcode"
                            value={address.postcode}
                            onChange={(e) =>
                                setAddress({
                                    ...address,
                                    postcode: e.target.value,
                                })
                            }
                        />

                        <input
                            placeholder="Stad"
                            value={address.stad}
                            onChange={(e) =>
                                setAddress({
                                    ...address,
                                    stad: e.target.value,
                                })
                            }
                        />

                        <input
                            placeholder="Land"
                            value={address.land}
                            onChange={(e) =>
                                setAddress({
                                    ...address,
                                    land: e.target.value,
                                })
                            }
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <main className={styles.accountPage}>
            <button className={styles.backButton}>
                ← Terug naar startpagina
            </button>

            <h1>Dashboard</h1>
            <p className={styles.subtitle}>
                Beheer uw persoonlijke gegevens en voorkeuren
            </p>

            <div className={styles.tabs}>
                <button
                    type="button"
                    className={
                        activeTab === "personal"
                            ? styles.activeTab
                            : styles.tab
                    }
                    onClick={() => setActiveTab("personal")}
                >
                    Persoonlijke gegevens
                </button>

                <button
                    type="button"
                    className={
                        activeTab === "addresses"
                            ? styles.activeTab
                            : styles.tab
                    }
                    onClick={() => setActiveTab("addresses")}
                >
                    Adressen
                </button>
            </div>

            {activeTab === "personal" && (
                <section className={styles.accountCard}>
                    <form onSubmit={handleSave}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Volledige naam</label>
                                <input
                                    value={fullname}
                                    onChange={(e) =>
                                        setFullname(e.target.value)
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>E-mailadres</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Telefoonnummer</label>
                                <input
                                    value={phoneNumber}
                                    onChange={(e) =>
                                        setPhoneNumber(e.target.value)
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Geboortedatum</label>
                                <input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) =>
                                        setBirthDate(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {message && (
                            <p className={styles.message}>{message}</p>
                        )}

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                            >
                                Annuleren
                            </button>

                            <button
                                type="submit"
                                className={styles.saveButton}
                            >
                                Opslaan
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {activeTab === "addresses" && (
                <section className={styles.addressList}>
                    {renderAddressCard(
                        "Factuuradres",
                        billingAdress,
                        editingBilling,
                        setEditingBilling,
                        setBillingAddress
                    )}

                    {renderAddressCard(
                        "Bezorgadres",
                        shippingAdress,
                        editingShipping,
                        setEditingShipping,
                        setShippingAddress
                    )}

                    {message && (
                        <p className={styles.message}>{message}</p>
                    )}

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.saveButton}
                            onClick={handleSaveAddresses}
                        >
                            Adressen opslaan
                        </button>
                    </div>
                </section>
            )}
        </main>
    );
}