import {
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Box
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PrimaryButton from '../buttons/PrimaryButton';

interface NavItem {
    label: string;
    icon: ReactNode;
    path: string;
}

const DRAWER_WIDTH = 240;

const navItems: NavItem[] = [
    { label: 'Dashboard',    icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Bestellingen', icon: <ShoppingBagIcon />, path: '/orders' },
    { label: 'Profiel',      icon: <PersonIcon />,      path: '/profile' },
];

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                },
            }}
        >
            <Toolbar sx={{ flexDirection: 'column', alignItems: 'center', py: 2 }}>
                <img src="/logo.svg" alt="logo" style={{ width: 200, marginBottom: 35 }} />
                <PrimaryButton onClick={() => navigate('/bestelpagina')}>
                    Maak bestelling
                </PrimaryButton>
                <Typography variant="h5" noWrap sx={{ fontWeight: 'bold' }}>Mijn Overzicht</Typography>
            </Toolbar>
            <Box sx={{ overflow: 'auto' }}>
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
            </Box>
        </Drawer>
    );
}