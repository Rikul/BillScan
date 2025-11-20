import { BillRecord } from "../types";

const STORAGE_KEY = "billscan_records_v1";

export const saveBill = (bill: BillRecord): void => {
  const existing = getBills();
  const index = existing.findIndex((b) => b.id === bill.id);
  
  let updated: BillRecord[];
  if (index >= 0) {
    // Update existing
    updated = [...existing];
    updated[index] = bill;
  } else {
    // Create new
    updated = [bill, ...existing];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Storage quota exceeded or error", e);
    alert("Failed to save locally. Your storage might be full. Try deleting old bills.");
  }
};

export const getBills = (): BillRecord[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getBillById = (id: string): BillRecord | undefined => {
  const bills = getBills();
  return bills.find((b) => b.id === id);
};

export const deleteBill = (id: string): void => {
  const bills = getBills();
  const updated = bills.filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};