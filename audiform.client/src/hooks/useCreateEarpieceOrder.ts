import { useState } from 'react';
import type { EarSelections } from '../types/EarSelections';
import {
    getOrderSelectionRequests,
    type CreatedOrderSelection,
} from '../utils/orderSelectionUtils';
import { parseJsonResponse } from '../utils/orderFormatters';

export type CreatedOrder = {
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

interface UseCreateEarpieceOrderOptions {
    patientName: string;
    patientNumber: string;
    deliveryDate: string;
    remarks: string;
    selectedFiles: File[];
    sendMethod: string;
    rightSelections: EarSelections;
    leftSelections: EarSelections;
}

export function useCreateEarpieceOrder({
    patientName,
    patientNumber,
    deliveryDate,
    remarks,
    selectedFiles,
    sendMethod,
    rightSelections,
    leftSelections,
}: UseCreateEarpieceOrderOptions) {
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);

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

    return {
        createdOrder,
        submitError,
        submitSuccess,
        isSubmitting,
        handleCompleteOrder,
    };
}
