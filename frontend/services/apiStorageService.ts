import { BillRecord, IStorageService, BillsFilterParams, PaginatedBillsResponse } from "../types";

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

    async getBills(params?: BillsFilterParams): Promise<BillRecord[] | PaginatedBillsResponse> {
        const url = new URL(`${API_URL}/bills`, window.location.origin);
        
        if (params) {
            if (params.dateFrom) url.searchParams.append('dateFrom', params.dateFrom);
            if (params.dateTo) url.searchParams.append('dateTo', params.dateTo);
            if (params.storeName) url.searchParams.append('storeName', params.storeName);
            if (params.minAmount) url.searchParams.append('minAmount', params.minAmount);
            if (params.maxAmount) url.searchParams.append('maxAmount', params.maxAmount);
            if (params.searchTerm) url.searchParams.append('searchTerm', params.searchTerm);
            if (params.page !== undefined) url.searchParams.append('page', params.page.toString());
            if (params.pageSize !== undefined) url.searchParams.append('pageSize', params.pageSize.toString());
            if (params.sortField) url.searchParams.append('sortField', params.sortField);
            if (params.sortDirection) url.searchParams.append('sortDirection', params.sortDirection);
        }
        
        const response = await fetch(url.toString());
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
