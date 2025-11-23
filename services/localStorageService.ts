import { BillRecord, IStorageService } from "../types";

const STORAGE_KEY = "billscan_records_v1";

export class LocalStorageService implements IStorageService {
  saveBill(bill: BillRecord): void {
    const existing = this.getBills();
    const index = existing.findIndex((b) => b.id === bill.id);

    let updated: BillRecord[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = bill;
    } else {
      updated = [bill, ...existing];
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Storage quota exceeded or error", e);
      alert("Failed to save locally. Your storage might be full. Try deleting old bills.");
    }
  }

  getBills(): BillRecord[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  getBillById(id: string): BillRecord | undefined {
    return this.getBills().find((b) => b.id === id);
  }

  deleteBill(id: string): void {
    const bills = this.getBills();
    const updated = bills.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
}
