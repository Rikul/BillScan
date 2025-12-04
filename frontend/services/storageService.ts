import { BillRecord, IStorageService, BillsFilterParams, PaginatedBillsResponse, StatsResponse } from "../types";
import { ApiStorageService } from "./apiStorageService";

// Currently using API storage service
let service: IStorageService = new ApiStorageService();

// Facade re-exporting functions.
// We are transitioning to Async, so we return the service method results directly (Promises)
export const saveBill = async (bill: BillRecord) => await service.saveBill(bill);
export const getBills = async (params?: BillsFilterParams): Promise<BillRecord[] | PaginatedBillsResponse> => await service.getBills(params);
export const getBillById = async (id: string) => await service.getBillById(id);
export const deleteBill = async (id: string) => await service.deleteBill(id);
export const getStats = async (params?: BillsFilterParams): Promise<StatsResponse> => await service.getStats(params);

export const storageService = service;
