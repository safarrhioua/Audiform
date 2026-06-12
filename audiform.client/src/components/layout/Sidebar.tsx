import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Box
} from "@mui/material";

import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PrimaryButton from "../buttons/PrimaryButton";
import { API_URL } from "../../utils/config";

interface NavItem {
    label: string;
    icon: ReactNode;
    path: string;
}

const DRAWER_WIDTH = 240;

const navItems: NavItem[] = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/bestelpagina" },
    { label: "Bestellingen", icon: <ShoppingBagIcon />, path: "/orders" },
    { label: "Account", icon: <PersonIcon />, path: "/account" },
];

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    async function handleLogout() {
        const confirmed = window.confirm(
            "Weet u zeker dat u wilt uitloggen?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/Auth/Logout`, {
                method: "POST",
                credentials: "include",
            });

            if (response.ok) {
                navigate("/login");
                return;
            }

            alert("Uitloggen mislukt. Probeer het opnieuw.");
        } catch (error) {
            console.error("Uitloggen mislukt", error);
            alert("Er ging iets mis tijdens het uitloggen.");
        }
    }

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: DRAWER_WIDTH,
                    boxSizing: "border-box",
                },
            }}
        >
            <Toolbar
                sx={{
                    flexDirection: "column",
                    alignItems: "center",
                    py: 2,
                }}
            >
                <img
                    src="/logo.svg"
                    alt="logo"
                    style={{ width: 200, marginBottom: 35 }}
                />

                <PrimaryButton onClick={() => navigate("/configuratie")}>
                    Maak bestelling
                </PrimaryButton>

                <Typography variant="h5" noWrap sx={{ fontWeight: "bold" }}>
                    Mijn Overzicht
                </Typography>
            </Toolbar>

            <Box sx={{ overflow: "auto" }}>
                <List>
                    {navItems.map((item) => (
                        <ListItem key={item.label} disablePadding>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                selected={location.pathname === item.path}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon />
                            </ListItemIcon>
                            <ListItemText primary="Uitloggen" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </Drawer>
    );
}