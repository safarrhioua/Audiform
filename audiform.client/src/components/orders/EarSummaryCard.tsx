import { Box, Paper, Typography } from '@mui/material';
import type { EarSelections } from '../../types/EarSelections';
import { getSelectionRows } from '../../utils/orderSelectionUtils';

interface EarSummaryCardProps {
    title: string;
    color: string;
    selections: EarSelections;
}

export default function EarSummaryCard({
    title,
    color,
    selections,
}: EarSummaryCardProps) {
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
