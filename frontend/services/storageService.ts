import { BillRecord, IStorageService } from "../types";
import { ApiStorageService } from "./apiStorageService";

// Currently using API storage service
let service: IStorageService = new ApiStorageService();

// Facade re-exporting functions.
// We are transitioning to Async, so we return the service method results directly (Promises)
export const saveBill = async (bill: BillRecord) => await service.saveBill(bill);
export const getBills = async () => await service.getBills();
export const getBillById = async (id: string) => await service.getBillById(id);
export const deleteBill = async (id: string) => await service.deleteBill(id);

export const storageService = service;
