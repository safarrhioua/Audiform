import { Button } from '@mui/material';
import type { ReactNode } from 'react';

interface SecondaryButtonProps {
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
}

export default function SecondaryButton({ onClick, children, disabled }: SecondaryButtonProps) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      disabled={disabled}
      sx={{
        backgroundColor: 'white',
        color: 'primary.main',
        '&:hover': {
          backgroundColor: 'primary.main',
          color: 'white',
        },
      }}
    >
      {children}
    </Button>
  );
}