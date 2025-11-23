import { BillRecord, IStorageService } from "../types";
import { LocalStorageService } from "./localStorageService";
import { SqliteStorageService } from "./sqliteStorageService";

// Select backend via Vite env variable; default to 'local'.
// This file should not need modification when adding new backends if they
// are wired through an extended selection mechanism or replaced by build-time aliasing.
const backendType = (import.meta as any).env?.VITE_STORAGE_BACKEND || "local";

let service: IStorageService;
switch (backendType) {
  case "sqlite":
    service = new SqliteStorageService();
    break;
  case "local":
  default:
    service = new LocalStorageService();
    break;
}

// Facade re-exporting functions to keep existing imports unchanged.
export const saveBill = (bill: BillRecord) => service.saveBill(bill);
export const getBills = () => service.getBills() as BillRecord[]; // sync in current implementations
export const getBillById = (id: string) => service.getBillById(id);
export const deleteBill = (id: string) => service.deleteBill(id);

// Export the concrete instance if direct access is needed.
export const storageService = service;