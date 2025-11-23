import { BillRecord, IStorageService } from "../types";

// Placeholder implementation for a future SQLite-backed storage.
// For now this uses an in-memory array synchronized to localStorage under a different key
// to simulate persistence without introducing a sqlite dependency.
// A real implementation might use SQL.js (WASM) or a backend API.

const SQLITE_SIM_KEY = "billscan_sqlite_sim_v1";

function load(): BillRecord[] {
  const raw = localStorage.getItem(SQLITE_SIM_KEY);
  return raw ? JSON.parse(raw) : [];
}

function persist(records: BillRecord[]): void {
  localStorage.setItem(SQLITE_SIM_KEY, JSON.stringify(records));
}

export class SqliteStorageService implements IStorageService {
  saveBill(bill: BillRecord): void {
    const records = load();
    const idx = records.findIndex(r => r.id === bill.id);
    if (idx >= 0) {
      records[idx] = bill;
    } else {
      records.unshift(bill);
    }
    persist(records);
  }

  getBills(): BillRecord[] {
    return load();
  }

  getBillById(id: string): BillRecord | undefined {
    return load().find(r => r.id === id);
  }

  deleteBill(id: string): void {
    const records = load().filter(r => r.id !== id);
    persist(records);
  }
}
