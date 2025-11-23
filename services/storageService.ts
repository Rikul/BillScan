import { BillRecord, IStorageService } from "../types";
import { LocalStorageService } from "./localStorageService";
import { SqliteStorageService } from "./sqliteStorageService";
import { ApiStorageService } from "./apiStorageService";

// Select backend via Vite env variable; default to 'local'.
const backendType = (import.meta as any).env?.VITE_STORAGE_BACKEND || "api"; // Changed default to api

let service: IStorageService;
switch (backendType) {
  case "api":
    service = new ApiStorageService();
    break;
  case "sqlite":
    service = new SqliteStorageService();
    break;
  case "local":
  default:
    service = new LocalStorageService();
    break;
}

// Facade re-exporting functions.
// We are transitioning to Async, so we return the service method results directly (Promises)
export const saveBill = async (bill: BillRecord) => Promise.resolve(service.saveBill(bill));
export const getBills = async () => Promise.resolve(service.getBills());
export const getBillById = async (id: string) => Promise.resolve(service.getBillById(id));
export const deleteBill = async (id: string) => Promise.resolve(service.deleteBill(id));

export const storageService = service;
