import { Box, Typography } from '@mui/material';
import type { EarpieceTemplate } from '../../types/EarpieceTemplate';

interface ProductDetailsProps {
    template: EarpieceTemplate;
}

export default function ProductDetails({ template }: ProductDetailsProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
                justifyContent: 'center',
                maxWidth: 520,
            }}
        >
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Product
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {template.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 500 }}>
                Beschrijving product:
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7, maxWidth: 500 }}>
                {template.description || 'Geen beschrijving beschikbaar.'}
            </Typography>
        </Box>
    );
}
