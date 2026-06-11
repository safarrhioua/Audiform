import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
    Alert,
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

type OrderSelectionRequest = {
    ear_side: 'left' | 'right';
    step_id: number;
    option_id: number | null;
    value_text: string | null;
};

type CreatedOrderSelection = {
    earSide: 'left' | 'right';
    stepId: number;
    stepName: string | null;
    optionId: number | null;
    optionName: string | null;
    valueText: string | null;
};

type CreatedOrder = {
    orderId: number;
    shopOrderId: string;
    patientName: string;
    patientNumber: string;
    deliveryDate: string;
    remarks: string | null;
    sendMethod: string | null;
    uploadedFileNames: string[];
    selections: CreatedOrderSelection[];
};

function getOrderSelectionRequests(
    earSide: 'left' | 'right',
    selections: EarSelections,
): OrderSelectionRequest[] {
    return Object.values(selections).flatMap((stepSelections) =>
        stepSelections.map((selection) => ({
            ear_side: earSide,
            step_id: selection.stepId,
            option_id: selection.optionId,
            value_text: selection.valueText,
        })),
    );
}

function getCreatedOrderSelectionRows(
    selections: CreatedOrderSelection[],
    earSide: 'left' | 'right',
) {
    return selections
        .filter((selection) => selection.earSide === earSide)
        .map((selection) => ({
            label: selection.stepName ?? `Stap ${selection.stepId}`,
            value: selection.valueText || selection.optionName || '-',
        }));
}

function getSelectionRows(selections: EarSelections) {
    return Object.values(selections).flatMap((stepSelections) =>
        stepSelections.map((selection) => ({
            label: selection.stepName,
            value: selection.valueText || selection.optionName || '-',
        })),
    );
}

function formatSendMethod(sendMethod: string | null) {
    if (sendMethod === 'digital') {
        return 'Digitaal versturen';
    }

    if (sendMethod === 'physical') {
        return 'Fysiek versturen';
    }

    return '-';
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

function CreatedOrderEarSummaryCard({
    title,
    color,
    selections,
    earSide,
}: {
    title: string;
    color: string;
    selections: CreatedOrderSelection[];
    earSide: 'left' | 'right';
}) {
    const rows = getCreatedOrderSelectionRows(selections, earSide);

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
    const [patientName, setPatientName] = useState('');
    const [patientNumber, setPatientNumber] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [remarks, setRemarks] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [sendMethod, setSendMethod] = useState('physical');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);

    const orderDate = useMemo(
        () =>
            new Intl.DateTimeFormat('nl-NL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }).format(new Date()),
        [],
    );

    function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
        setSelectedFiles(Array.from(event.target.files ?? []));
    }

    function handleSendMethodChange(newSendMethod: string) {
        setSendMethod(newSendMethod);

        if (newSendMethod === 'physical') {
            setSelectedFiles([]);
        }
    }

    async function handleCompleteOrder() {
        setSubmitError(null);
        setSubmitSuccess(null);

        if (!patientName.trim() || !patientNumber.trim() || !deliveryDate) {
            setSubmitError('Vul patiëntnaam, referentie en gewenste leverdatum in.');
            return;
        }

        const formData = new FormData();
        formData.append('patient_name', patientName.trim());
        formData.append('patient_number', patientNumber.trim());
        formData.append('delivery_date', deliveryDate);
        formData.append('remarks', remarks.trim());
        formData.append('send_method', sendMethod);
        formData.append(
            'selections_json',
            JSON.stringify([
                ...getOrderSelectionRequests('right', rightSelections),
                ...getOrderSelectionRequests('left', leftSelections),
            ]),
        );

        selectedFiles.forEach((file) => {
            formData.append('files', file);
        });

        try {
            setIsSubmitting(true);

            const response = await fetch('https://localhost:7050/api/earpiece-order', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            const responseText = await response.text();
            const responseData = responseText ? parseJsonResponse(responseText) : null;

            if (!response.ok) {
                throw new Error(
                    responseData?.error ??
                    responseData?.message ??
                    'De bestelling kon niet worden afgerond.',
                );
            }

            const createdOrderData = responseData as CreatedOrder;
            setCreatedOrder(createdOrderData);
            setSubmitSuccess(
                createdOrderData.shopOrderId
                    ? `Bestelling succesvol afgerond. Ordernummer: ${createdOrderData.shopOrderId}`
                    : 'Bestelling succesvol afgerond.',
            );
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : 'Er ging iets mis bij het afronden van de bestelling.',
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    function parseJsonResponse(responseText: string) {
        try {
            return JSON.parse(responseText);
        } catch {
            return { message: responseText };
        }
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

            {submitError ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {submitError}
                </Alert>
            ) : null}

            {submitSuccess ? (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {submitSuccess}
                </Alert>
            ) : null}

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
                                    {createdOrder?.shopOrderId ?? 'Wordt aangemaakt bij afronden'}
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
                            {createdOrder ? (
                                <>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Patiëntnaam
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {createdOrder.patientName}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Referentie
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {createdOrder.patientNumber}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Gewenste leverdatum
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {new Intl.DateTimeFormat('nl-NL').format(
                                                new Date(createdOrder.deliveryDate),
                                            )}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Opmerkingen
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {createdOrder.remarks || '-'}
                                        </Typography>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Patiëntnaam *"
                                        value={patientName}
                                        onChange={(event) => setPatientName(event.target.value)}
                                    />
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Referentie *"
                                        value={patientNumber}
                                        onChange={(event) => setPatientNumber(event.target.value)}
                                    />
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Gewenste leverdatum *"
                                        type="date"
                                        value={deliveryDate}
                                        onChange={(event) => setDeliveryDate(event.target.value)}
                                        slotProps={{ inputLabel: { shrink: true } }}
                                    />
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Opmerkingen"
                                        multiline
                                        minRows={3}
                                        value={remarks}
                                        onChange={(event) => setRemarks(event.target.value)}
                                        placeholder="Eventuele opmerkingen..."
                                    />
                                </>
                            )}
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
                        {createdOrder ? (
                            <>
                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 2 }}>
                                    {formatSendMethod(createdOrder.sendMethod)}
                                </Typography>
                                {createdOrder.uploadedFileNames.length > 0 ? (
                                    <Box>
                                        {createdOrder.uploadedFileNames.map((fileName) => (
                                            <Typography
                                                key={fileName}
                                                variant="body2"
                                                sx={{ color: 'text.secondary' }}
                                            >
                                                {fileName}
                                            </Typography>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Geen bestanden geüpload.
                                    </Typography>
                                )}
                            </>
                        ) : (
                            <>
                                <RadioGroup
                                    value={sendMethod}
                                    onChange={(event) => handleSendMethodChange(event.target.value)}
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
                                {sendMethod === 'digital' ? (
                                    <Box
                                        component="label"
                                        sx={{
                                            border: '1px dashed',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            p: 4,
                                            textAlign: 'center',
                                            bgcolor: 'grey.50',
                                            cursor: 'pointer',
                                            display: 'block',
                                        }}
                                    >
                                        <input
                                            hidden
                                            multiple
                                            type="file"
                                            accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                                            onChange={handleFilesChange}
                                        />
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            Klik om bestanden te uploaden
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            PNG, JPG, PDF tot 10MB
                                        </Typography>
                                    </Box>
                                ) : null}
                            </>
                        )}
                        {!createdOrder && sendMethod === 'digital' && selectedFiles.length > 0 ? (
                            <Box sx={{ mt: 2 }}>
                                {selectedFiles.map((file) => (
                                    <Typography
                                        key={`${file.name}-${file.lastModified}`}
                                        variant="body2"
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        {file.name}
                                    </Typography>
                                ))}
                            </Box>
                        ) : null}
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

                    {createdOrder ? (
                        <>
                            <CreatedOrderEarSummaryCard
                                title="Rechter oor"
                                color="secondary.main"
                                selections={createdOrder.selections}
                                earSide="right"
                            />
                            <CreatedOrderEarSummaryCard
                                title="Linker oor"
                                color="primary.main"
                                selections={createdOrder.selections}
                                earSide="left"
                            />
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                {!createdOrder ? (
                    <>
                        <Button variant="outlined" onClick={handleEditConfiguration}>
                            Wijzig configuratie
                        </Button>
                        <Button variant="contained" onClick={handleCompleteOrder} disabled={isSubmitting}>
                            {isSubmitting ? 'Bezig met afronden...' : 'Afronden'}
                        </Button>
                    </>
                ) : (
                        <Button variant="contained" onClick={() => navigate('/configuratie')}>
                        Nieuwe bestelling maken
                    </Button>
                )}
            </Box>
        </Box>
    );
}
