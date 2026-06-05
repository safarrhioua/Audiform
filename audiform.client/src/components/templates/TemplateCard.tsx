import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { EarpieceTemplate } from '../../types/EarpieceTemplate';

interface TemplateCardProps {
    template: EarpieceTemplate;
}

function getImageUrl(imagePath: string | null) {
    if (!imagePath) {
        return null;
    }

    return imagePath;
}

export default function TemplateCard({ template }: TemplateCardProps) {
    const imageUrl = getImageUrl(template.imagePath);
    const navigate = useNavigate();

    function handleConfigure() {
        navigate('/configuratie', {
            state: {
                template,
                rightTemplateId: template.id,
                leftTemplateId: undefined,
            },
        });
    }

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            {imageUrl ? (
                <CardMedia
                    component="img"
                    image={imageUrl}
                    alt={template.name}
                    sx={{
                        aspectRatio: '4 / 3',
                        objectFit: 'cover',
                        bgcolor: 'grey.100',
                    }}
                />
            ) : (
                <Box
                    sx={{
                        aspectRatio: '4 / 3',
                        bgcolor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                    }}
                >
                    <Typography variant="body2">Geen afbeelding beschikbaar</Typography>
                </Box>
            )}

            <CardContent
                sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    flexGrow: 1,
                }}
            >
                <Typography
                    variant="h6"
                    align="center"
                    sx={{ fontWeight: 700, color: 'text.primary' }}
                >
                    {template.name}
                </Typography>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleConfigure}
                    sx={{
                        mt: 'auto',
                        maxWidth: 220,
                        bgcolor: 'primary.main',
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 1,
                    }}
                >
                    Op maat
                </Button>
            </CardContent>
        </Card>
    );
}
