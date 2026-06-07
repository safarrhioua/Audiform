import { useMemo, useState } from 'react';
import {
    Box,
    Button,
    FormControlLabel,
    Paper,
    Radio,
    RadioGroup,
    TextField,
    Typography,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import type { EarSelections } from '../types/EarSelections';
import type { EarpieceTemplate } from '../types/EarpieceTemplate';

interface BestellingAfrondenLocationState {
    template?: EarpieceTemplate;
    rightTemplateId?: number;
    leftTemplateId?: number;
    rightSelections?: EarSelections;
    leftSelections?: EarSelections;
}

function getSelectionRows(selections: EarSelections) {
    return Object.values(selections).flatMap((stepSelections) =>
        stepSelections.map((selection) => ({
            label: selection.stepName,
            value: selection.valueText || selection.optionName || '-',
        })),
    );
}

function EarSummaryCard({
    title,
    color,
    selections,
}: {
    title: string;
    color: string;
    selections: EarSelections;
}) {
    const rows = getSelectionRows(selections);

    return (
        <Paper
            sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: color,
                boxShadow: 'none',
            }}
        >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color, mb: 1.5 }}>
                {title}
            </Typography>
            {rows.length > 0 ? (
                rows.map((row) => (
                    <Box key={`${row.label}-${row.value}`} sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {row.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {row.value}
                        </Typography>
                    </Box>
                ))
            ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Geen configuratie gekozen.
                </Typography>
            )}
        </Paper>
    );
}

export default function BestellingAfronden() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        template,
        rightTemplateId,
        leftTemplateId,
        rightSelections = {},
        leftSelections = {},
    } =
        (location.state ?? {}) as BestellingAfrondenLocationState;
    const [sendMethod, setSendMethod] = useState('physical');

    const orderDate = useMemo(
        () =>
            new Intl.DateTimeFormat('nl-NL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }).format(new Date()),
        [],
    );

    function handleCompleteOrder() {
        console.log('Bestelling afronden', {
            template,
            rightTemplateId,
            leftTemplateId,
            rightSelections,
            leftSelections,
            sendMethod,
        });
    }

    function handleEditConfiguration() {
        const configurationTemplateId = rightTemplateId ?? leftTemplateId ?? template?.id;

        if (!configurationTemplateId) {
            navigate(-1);
            return;
        }

        navigate(`/configuratie/${configurationTemplateId}`, {
            state: {
                template,
                rightTemplateId,
                leftTemplateId,
                rightSelections,
                leftSelections,
            },
        });
    }

    return (
        <Box sx={{ maxWidth: 1120 }}>
            <Button
                variant="text"
                onClick={handleEditConfiguration}
                sx={{
                    mb: 3,
                    color: 'text.primary',
                    textTransform: 'none',
                    px: 0,
                }}
            >
                ← Terug naar configuratie
            </Button>

            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                Bestelling afronden
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Controleer uw configuratie en vul de aanvullende gegevens in
            </Typography>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'minmax(0, 1fr) minmax(280px, 380px)',
                    },
                    gap: 3,
                    alignItems: 'start',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 'none',
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}
                        >
                            Bestelgegevens
                        </Typography>
                        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Order nummer
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    Wordt aangemaakt bij afronden
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Datum
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {orderDate}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Status
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    Configuratie gereed
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'grid', gap: 1.5 }}>
                            <TextField fullWidth size="small" label="Referentie *" />
                            <TextField
                                fullWidth
                                size="small"
                                label="Gewenste leverdatum *"
                                type="date"
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                            <TextField
                                fullWidth
                                size="small"
                                label="Opmerkingen"
                                multiline
                                minRows={3}
                                placeholder="Eventuele opmerkingen..."
                            />
                        </Box>
                    </Paper>

                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 'none',
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}
                        >
                            Afdrukken versturen
                        </Typography>
                        <RadioGroup
                            value={sendMethod}
                            onChange={(event) => setSendMethod(event.target.value)}
                            sx={{ mb: 2 }}
                        >
                            <FormControlLabel
                                value="physical"
                                control={<Radio size="small" />}
                                label="Fysiek versturen"
                            />
                            <FormControlLabel
                                value="digital"
                                control={<Radio size="small" />}
                                label="Digitaal versturen"
                            />
                        </RadioGroup>
                        <Box
                            sx={{
                                border: '1px dashed',
                                borderColor: 'divider',
                                borderRadius: 2,
                                p: 4,
                                textAlign: 'center',
                                bgcolor: 'grey.50',
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Klik om bestanden te uploaden
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                PNG, JPG, PDF tot 10MB
                            </Typography>
                        </Box>
                    </Paper>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 'none',
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}
                        >
                            Product
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>
                            {template?.name ?? 'Product'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {template?.description ?? 'Kiezen een oorstukje'}
                        </Typography>
                    </Paper>

                    <EarSummaryCard
                        title="Rechter oor"
                        color="secondary.main"
                        selections={rightSelections}
                    />
                    <EarSummaryCard
                        title="Linker oor"
                        color="primary.main"
                        selections={leftSelections}
                    />
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button variant="outlined" onClick={handleEditConfiguration}>
                    Wijzig configuratie
                </Button>
                <Button variant="contained" onClick={handleCompleteOrder}>
                    Afronden
                </Button>
            </Box>
        </Box>
    );
}
