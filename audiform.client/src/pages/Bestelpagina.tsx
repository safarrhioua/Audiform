import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    CircularProgress,
    Typography,
} from '@mui/material';
import TemplateCard from '../components/templates/TemplateCard';
import type { EarpieceTemplate } from '../types/EarpieceTemplate';

const API_BASE_URL = 'https://localhost:7050';
const TEMPLATES_ENDPOINT = `${API_BASE_URL}/api/earpiece-templates`;


export default function Bestelpagina() {
    const [templates, setTemplates] = useState<EarpieceTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchTemplates() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(TEMPLATES_ENDPOINT, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('De producten konden niet worden opgehaald.');
                }

                const data: unknown = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error('De producten konden niet worden verwerkt.');
                }

                if (isMounted) {
                    setTemplates(data as EarpieceTemplate[]);
                }
            } catch (fetchError) {
                if (isMounted) {
                    setError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : 'Er ging iets mis bij het ophalen van de producten.',
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        void fetchTemplates();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <Box>
            <Box
                sx={{
                    mb: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                    Producten
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 720 }}>
                    Kies een beschikbaar product om een nieuwe bestelling samen te stellen.
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : templates.length === 0 ? (
                <Alert severity="info">Er zijn geen producten beschikbaar voor deze shop.</Alert>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, minmax(0, 1fr))',
                            lg: 'repeat(3, minmax(0, 1fr))',
                        },
                        gap: 4,
                    }}
                >
                    {templates.map((template) => (
                        <TemplateCard key={template.id} template={template} />
                    ))}
                </Box>
            )}
        </Box>
    );
}
