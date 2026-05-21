import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps){
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* Zorgt dat content niet achter de Sidebar verdwijnt */}
        {children}
      </Box>
    </Box>
  );
}