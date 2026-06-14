import { useEffect, useMemo, useState } from 'react';
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
import CreatedOrderEarSummaryCard from '../components/orders/CreatedOrderEarSummaryCard';
import EarSummaryCard from '../components/orders/EarSummaryCard';
import { useCreateEarpieceOrder } from '../hooks/useCreateEarpieceOrder';
import type { EarSelections } from '../types/EarSelections';
import type { EarpieceTemplate } from '../types/EarpieceTemplate';
import { formatSendMethod } from '../utils/orderFormatters';

const MAX_FILES = 4;
const MAX_FILE_SIZE_IN_BYTES = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];

interface BestellingAfrondenLocationState {
    template?: EarpieceTemplate;
    rightTemplateId?: number;
    leftTemplateId?: number;
    rightSelections?: EarSelections;
    leftSelections?: EarSelections;
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
    const [fileUploadError, setFileUploadError] = useState('');
    const [sendMethod, setSendMethod] = useState('physical');
    const {
        createdOrder,
        submitError,
        submitSuccess,
        isSubmitting,
        handleCompleteOrder,
    } = useCreateEarpieceOrder({
        patientName,
        patientNumber,
        deliveryDate,
        remarks,
        selectedFiles,
        sendMethod,
        rightSelections,
        leftSelections,
    });
    const hasOrderConfiguration =
        Boolean(rightTemplateId || leftTemplateId) ||
        Object.keys(rightSelections).length > 0 ||
        Object.keys(leftSelections).length > 0;

    useEffect(() => {
        if (!hasOrderConfiguration) {
            navigate('/configuratie', { replace: true });
        }
    }, [hasOrderConfiguration, navigate]);

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
        const files = event.currentTarget.files
            ? Array.from(event.currentTarget.files)
            : [];
        const errors: string[] = [];

        if (files.length === 0) {
            event.currentTarget.value = '';
            return;
        }

        const filesWithAllowedTypes = files.filter((file) => {
            if (ALLOWED_FILE_TYPES.includes(file.type)) {
                return true;
            }

            errors.push(`${file.name} heeft geen toegestaan bestandstype.`);
            return false;
        });

        const filesWithAllowedSizes = filesWithAllowedTypes.filter((file) => {
            if (file.size <= MAX_FILE_SIZE_IN_BYTES) {
                return true;
            }

            errors.push(`${file.name} is groter dan 10MB.`);
            return false;
        });

        const availableSlots = MAX_FILES - selectedFiles.length;
        const filesToAdd = filesWithAllowedSizes.slice(0, Math.max(availableSlots, 0));

        if (filesWithAllowedSizes.length > availableSlots) {
            errors.push(`U kunt maximaal ${MAX_FILES} bestanden toevoegen.`);
        }

        if (filesToAdd.length > 0) {
            setSelectedFiles((currentFiles) => [...currentFiles, ...filesToAdd]);
        }

        setFileUploadError(errors.join(' '));

        event.currentTarget.value = '';
    }

    function handleRemoveSelectedFile(fileIndex: number) {
        setSelectedFiles((currentFiles) =>
            currentFiles.filter((_, index) => index !== fileIndex),
        );
        setFileUploadError('');
    }

    function handleSendMethodChange(newSendMethod: string) {
        setSendMethod(newSendMethod);

        if (newSendMethod === 'physical') {
            setSelectedFiles([]);
            setFileUploadError('');
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
                                            PNG, JPG, JPEG of PDF. Maximaal 4 bestanden, maximaal 10MB per bestand.
                                        </Typography>
                                    </Box>
                                ) : null}
                            </>
                        )}
                        {!createdOrder && sendMethod === 'digital' && fileUploadError ? (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {fileUploadError}
                            </Alert>
                        ) : null}
                        {!createdOrder && sendMethod === 'digital' && selectedFiles.length > 0 ? (
                            <Box sx={{ mt: 2, display: 'grid', gap: 1 }}>
                                {selectedFiles.map((file, index) => (
                                    <Box
                                        key={`${file.name}-${file.lastModified}`}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 2,
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'text.secondary',
                                                minWidth: 0,
                                                overflowWrap: 'anywhere',
                                            }}
                                        >
                                            {file.name}
                                        </Typography>
                                        <Button
                                            size="small"
                                            variant="text"
                                            onClick={() => handleRemoveSelectedFile(index)}
                                            sx={{ flexShrink: 0, textTransform: 'none' }}
                                        >
                                            Verwijderen
                                        </Button>
                                    </Box>
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
