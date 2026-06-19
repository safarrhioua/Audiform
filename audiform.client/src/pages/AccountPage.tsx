import { useEffect, useState } from "react";
import styles from "../Css/AccountPage.module.css";
import { getErrorMessage } from "../hooks/ApiHelper";
import { API_URL } from "../utils/config";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../hooks/UsePageTitle";

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
    land: "",
};

export default function AccountPage() {
    
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [birthDate, setBirthDate] = useState("");

    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const [activeTab, setActiveTab] = useState("personal");
    usePageTitle(
        activeTab === "personal"
            ? "Persoonlijke gegevens"
            : "Adressen"
    );
    const [billingAdress, setBillingAddress] = useState<Address>(emptyAddress);
    const [shippingAdress, setShippingAddress] = useState<Address>(emptyAddress);

    const [editingBilling, setEditingBilling] = useState(false);
    const [editingShipping, setEditingShipping] = useState(false);

    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingAddresses, setIsSavingAddresses] = useState(false);

    const [originalProfile, setOriginalProfile] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        birthDate: "",
    });

    const navigate = useNavigate();
    function showError(text: string) {
        setIsSuccess(false);
        setMessage(text);
    }

    function showSuccess(text: string) {
        setIsSuccess(true);
        setMessage(text);
    }

    async function fetchAddress(
        addressType: "Billing" | "Shipping",
        setAddress: React.Dispatch<React.SetStateAction<Address>>
    ) {
        const response = await fetch(`${API_URL}/api/Adress/GetAdres/${addressType}`, {
            method: "GET",
            credentials: "include",
        });

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
            const response = await fetch(`${API_URL}/api/UserManagement/GetUser`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) return;

            const data = await response.json();

            setFullname(data.fullname || "");
            setEmail(data.email || "");
            setPhoneNumber(data.phoneNumber || "");
            setBirthDate(data.dateofbirth || "");

            setOriginalProfile({
                fullname: data.fullname || "",
                email: data.email || "",
                phoneNumber: data.phoneNumber || "",
                birthDate: data.dateofbirth || "",
            });
        }

        fetchProfile();
        fetchAddress("Billing", setBillingAddress);
        fetchAddress("Shipping", setShippingAddress);
    }, []);

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");
        setIsSavingProfile(true);

        try {
            if (!email.trim()) {
                showError("E-mailadres mag niet leeg zijn.");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                showError("Vul een geldig e-mailadres in.");
                return;
            }

            const response = await fetch(`${API_URL}/api/UserManagement/updateprofile`, {
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
            });

            if (!response.ok) {
                const errorMessage = await getErrorMessage(
                    response,
                    "Profiel bijwerken mislukt."
                );

                showError(errorMessage);
                return;
            }

            const text = await response.text();

            setOriginalProfile({
                fullname,
                email,
                phoneNumber,
                birthDate,
            });

            showSuccess(text || "Profiel succesvol bijgewerkt.");
        } finally {
            setIsSavingProfile(false);
        }
    }

    function validateAddress(
        address: Address,
        addressName: string
    ): string | null {
        const hasAnyField =
            address.straat.trim() ||
            address.postcode.trim() ||
            address.stad.trim() ||
            address.land.trim();

        if (!hasAnyField) {
            return null;
        }

        if (!address.straat.trim()) {
            return `${addressName}: straat is verplicht.`;
        }

        if (!address.postcode.trim()) {
            return `${addressName}: postcode is verplicht.`;
        }

        if (!address.stad.trim()) {
            return `${addressName}: stad is verplicht.`;
        }

        if (!address.land.trim()) {
            return `${addressName}: land is verplicht.`;
        }

        return null;
    }

    async function handleSaveAddresses() {
        setMessage("");
        setIsSavingAddresses(true);

        try {
            if (editingBilling) {
                const billingError = validateAddress(
                    billingAdress,
                    "Factuuradres"
                );

                if (billingError) {
                    showError(billingError);
                    return;
                }
            }

            if (editingShipping) {
                const shippingError = validateAddress(
                    shippingAdress,
                    "Bezorgadres"
                );

                if (shippingError) {
                    showError(shippingError);
                    return;
                }
            }

            const response = await fetch(`${API_URL}/api/Adress/save-adresses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    billingAdress,
                    shippingAdress,
                }),
            });

            if (!response.ok) {
                const errorMessage = await getErrorMessage(
                    response,
                    "Adressen opslaan mislukt."
                );

                showError(errorMessage);
                return;
            }

            const text = await response.text();

            setEditingBilling(false);
            setEditingShipping(false);

            await fetchAddress("Billing", setBillingAddress);
            await fetchAddress("Shipping", setShippingAddress);

            showSuccess(text || "Adressen succesvol opgeslagen.");
        } finally {
            setIsSavingAddresses(false);
        }
    }

    function handleCancelProfile() {
        setFullname(originalProfile.fullname);
        setEmail(originalProfile.email);
        setPhoneNumber(originalProfile.phoneNumber);
        setBirthDate(originalProfile.birthDate);
        setMessage("");
    }

    function renderMessage() {
        if (!message) return null;

        return (
            <div
                className={
                    isSuccess
                        ? styles.messageSuccess
                        : styles.messageError
                }
            >
                {message}
            </div>
        );
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
                        onClick={async () => {
                            setMessage("");

                            if (isEditing) {
                                await fetchAddress(
                                    title === "Factuuradres"
                                        ? "Billing"
                                        : "Shipping",
                                    setAddress
                                );
                            }

                            setIsEditing(!isEditing);
                        }}
                        disabled={isSavingAddresses}
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
                        <div className={styles.formGroup}>
                            <label>Straat</label>
                            <input
                                value={address.straat}
                                disabled={isSavingAddresses}
                                onChange={(e) =>
                                    setAddress({
                                        ...address,
                                        straat: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Postcode</label>
                            <input
                                value={address.postcode}
                                disabled={isSavingAddresses}
                                onChange={(e) =>
                                    setAddress({
                                        ...address,
                                        postcode: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Stad</label>
                            <input
                                value={address.stad}
                                disabled={isSavingAddresses}
                                onChange={(e) =>
                                    setAddress({
                                        ...address,
                                        stad: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Land</label>
                            <input
                                value={address.land}
                                disabled={isSavingAddresses}
                                onChange={(e) =>
                                    setAddress({
                                        ...address,
                                        land: e.target.value,
                                    })
                                }
                            />
                        </div>
                        
                    </div>
                )}
            </div>)}

    return (
        <main className={styles.accountPage}>
            <button className={styles.backButton} onClick={() => navigate("/bestelpagina")}>
                ← Terug naar startpagina
            </button>

            <h1>Account</h1>
            <p className={styles.subtitle}>
                Beheer uw persoonlijke gegevens en voorkeuren
            </p>

            <div className={styles.tabs}>
                <button
                    type="button"
                    className={activeTab === "personal" ? styles.activeTab : styles.tab}
                    onClick={() => {
                        setMessage("");
                        setActiveTab("personal");
                    }}
                >
                    Persoonlijke gegevens
                </button>

                <button
                    type="button"
                    className={activeTab === "addresses" ? styles.activeTab : styles.tab}
                    onClick={() => {
                        setMessage("");
                        setActiveTab("addresses");
                    }}
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
                                    disabled={isSavingProfile}
                                    onChange={(e) => setFullname(e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>E-mailadres</label>
                                <input
                                    type="email"
                                    value={email}
                                    disabled={isSavingProfile}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Telefoonnummer</label>
                                <input
                                    value={phoneNumber}
                                    disabled={isSavingProfile}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Geboortedatum</label>
                                <input
                                    type="date"
                                    value={birthDate}
                                    disabled={isSavingProfile}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {renderMessage()}

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={handleCancelProfile}
                                disabled={isSavingProfile}
                            >
                                Annuleren
                            </button>

                            <button
                                type="submit"
                                className={styles.saveButton}
                                disabled={isSavingProfile}
                            >
                                {isSavingProfile ? "Opslaan..." : "Opslaan"}
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

                    {renderMessage()}

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.saveButton}
                            onClick={handleSaveAddresses}
                            disabled={isSavingAddresses}
                        >
                            {isSavingAddresses ? "Opslaan..." : "Adressen opslaan"}
                        </button>
                    </div>
                </section>
            )}
        </main>
    );
}