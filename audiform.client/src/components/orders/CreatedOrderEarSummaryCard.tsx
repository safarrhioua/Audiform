import { Box, Paper, Typography } from '@mui/material';
import {
    getCreatedOrderSelectionRows,
    type CreatedOrderSelection,
} from '../../utils/orderSelectionUtils';

interface CreatedOrderEarSummaryCardProps {
    title: string;
    color: string;
    selections: CreatedOrderSelection[];
    earSide: 'left' | 'right';
}

export default function CreatedOrderEarSummaryCard({
    title,
    color,
    selections,
    earSide,
}: CreatedOrderEarSummaryCardProps) {
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
