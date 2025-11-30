import { BillData } from "../types";

const API_URL = '/api';

/**
 * Validates that the response data has the required BillData fields
 */
const isValidBillData = (data: unknown): data is BillData => {
    if (!data || typeof data !== 'object') return false;
    const bill = data as Record<string, unknown>;
    return (
        typeof bill.storeName === 'string' &&
        typeof bill.date === 'string' &&
        typeof bill.total === 'number' &&
        Array.isArray(bill.lineItems)
    );
};

/**
 * Extract bill data from an image using the backend API
 */
export const extractBillData = async (base64Image: string): Promise<BillData> => {
    const response = await fetch(`${API_URL}/extract-bill`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: base64Image }),
    });

    if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `Failed to extract bill data: ${response.statusText}`);
        }
        throw new Error(`Failed to extract bill data: ${response.statusText}`);
    }

    const data = await response.json();

    if (!isValidBillData(data)) {
        throw new Error('Invalid response format from server');
    }

    return data;
};
