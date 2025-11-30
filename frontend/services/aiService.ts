import { BillData } from "../types";

const API_URL = '/api';

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
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Failed to extract bill data: ${response.statusText}`);
  }
  
  return await response.json();
};
