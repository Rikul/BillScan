import { BillRecord, IStorageService } from "../types";

const API_URL = '/api'; // We will rely on Vite proxy

export class ApiStorageService implements IStorageService {
  async saveBill(bill: BillRecord): Promise<void> {
    const response = await fetch(`${API_URL}/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bill),
    });
    if (!response.ok) {
      throw new Error(`Failed to save bill: ${response.statusText}`);
    }
  }

  async getBills(): Promise<BillRecord[]> {
    const response = await fetch(`${API_URL}/bills`);
    if (!response.ok) {
        throw new Error(`Failed to fetch bills: ${response.statusText}`);
    }
    return await response.json();
  }

  async getBillById(id: string): Promise<BillRecord | undefined> {
    const response = await fetch(`${API_URL}/bills/${id}`);
    if (response.status === 404) {
        return undefined;
    }
    if (!response.ok) {
        throw new Error(`Failed to fetch bill: ${response.statusText}`);
    }
    return await response.json();
  }

  async deleteBill(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/bills/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`Failed to delete bill: ${response.statusText}`);
    }
  }
}
