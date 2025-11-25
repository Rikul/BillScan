import { BillRecord, IStorageService } from "../types";

const SQLITE_SIM_KEY = "billscan_sqlite_sim_v1";
const FAKE_BILLS: BillRecord[] = [
  // January 2024
  {
    id: "1",
    storeName: "Walmart",
    date: "2024-01-15",
    total: 125.50,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 115.50,
    tax: 10.00
  },
  {
    id: "2",
    storeName: "Target",
    date: "2024-01-20",
    total: 75.20,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 70.20,
    tax: 5.00
  },
  {
    id: "3",
    storeName: "Costco",
    date: "2024-01-25",
    total: 250.00,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 230.00,
    tax: 20.00
  },
  {
    id: "4",
    storeName: "Home Depot",
    date: "2024-01-28",
    total: 85.60,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 80.60,
    tax: 5.00
  },
  {
    id: "5",
    storeName: "Walmart",
    date: "2024-01-30",
    total: 65.40,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 60.40,
    tax: 5.00
  },
  // February 2024
  {
    id: "6",
    storeName: "Target",
    date: "2024-02-10",
    total: 95.30,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 90.30,
    tax: 5.00
  },
  {
    id: "7",
    storeName: "Costco",
    date: "2024-02-15",
    total: 350.00,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 325.00,
    tax: 25.00
  },
  {
    id: "8",
    storeName: "Home Depot",
    date: "2024-02-20",
    total: 110.00,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 100.00,
    tax: 10.00
  },
  {
    id: "9",
    storeName: "Walmart",
    date: "2024-02-25",
    total: 45.80,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 40.80,
    tax: 5.00
  },
  {
    id: "10",
    storeName: "Target",
    date: "2024-02-28",
    total: 150.00,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 140.00,
    tax: 10.00
  },
  // March 2024
  {
    id: "11",
    storeName: "Costco",
    date: "2024-03-05",
    total: 450.00,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 420.00,
    tax: 30.00
  },
  {
    id: "12",
    storeName: "Home Depot",
    date: "2024-03-10",
    total: 75.00,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 70.00,
    tax: 5.00
  },
  {
    id: "13",
    storeName: "Walmart",
    date: "2024-03-15",
    total: 90.00,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 85.00,
    tax: 5.00
  },
  {
    id: "14",
    storeName: "Target",
    date: "2024-03-20",
    total: 200.00,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 185.00,
    tax: 15.00
  },
  {
    id: "15",
    storeName: "Costco",
    date: "2024-03-25",
    total: 180.00,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 170.00,
    tax: 10.00
  },
  // April 2024
  {
    id: "16",
    storeName: "Home Depot",
    date: "2024-04-01",
    total: 55.00,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 50.00,
    tax: 5.00
  },
  {
    id: "17",
    storeName: "Walmart",
    date: "2024-04-05",
    total: 110.00,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 100.00,
    tax: 10.00
  },
  {
    id: "18",
    storeName: "Target",
    date: "2024-04-10",
    total: 130.00,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 120.00,
    tax: 10.00
  },
  {
    id: "19",
    storeName: "Costco",
    date: "2024-04-15",
    total: 300.00,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 280.00,
    tax: 20.00
  },
  {
    id: "20",
    storeName: "Home Depot",
    date: "2024-04-20",
    total: 95.00,
    imageData: "",
    createdAt: new Date().toISOString(),
    lineItems: [],
    subtotal: 90.00,
    tax: 5.00
  }
];

function load(): BillRecord[] {
  const useFakeDb = localStorage.getItem("use_fake_db");
  if (useFakeDb === "true") {
    return [...FAKE_BILLS];
  }
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
