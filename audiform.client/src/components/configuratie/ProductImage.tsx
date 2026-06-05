import { Box, Typography } from '@mui/material';

interface ProductImageProps {
    imagePath: string | null;
    name: string;
}

export default function ProductImage({ imagePath, name }: ProductImageProps) {
    if (!imagePath) {
        return (
            <Box
                sx={{
                    width: '100%',
                    aspectRatio: '4 / 3',
                    borderRadius: 2,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                    overflow: 'hidden',
                }}
            >
                <Typography variant="body2">Geen afbeelding beschikbaar</Typography>
            </Box>
        );
    }

    return (
        <Box
            component="img"
            src={imagePath}
            alt={name}
            sx={{
                width: '100%',
                aspectRatio: '4 / 3',
                objectFit: 'cover',
                borderRadius: 2,
                bgcolor: 'grey.100',
                display: 'block',
            }}
        />
    );
}
