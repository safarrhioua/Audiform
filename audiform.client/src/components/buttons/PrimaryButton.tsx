import { Button } from '@mui/material';
import type { ReactNode } from 'react';

interface PrimaryButtonProps {
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
}

export default function PrimaryButton({ onClick, children, disabled }: PrimaryButtonProps) {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      disabled={disabled}
      sx={{
        marginBottom: 5,
        backgroundColor: 'secondary.main',
        color: 'white',
        '&:hover': {
          backgroundColor: 'secondary.dark',
        },
      }}
    >
      {children}
    </Button>
  );
}