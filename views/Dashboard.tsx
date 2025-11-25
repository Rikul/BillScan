import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Receipt, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { BillRecord } from "../types";
import { getBills } from "../services/storageService";
import { Button, Card, Header, Input } from "../components/UI";
import { formatCurrency, formatDate } from "../utils";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const billsPerPage = 10;

  useEffect(() => {
    async function fetchBills() {
      const data = await getBills();
      setBills(data);
    }
    fetchBills();
  }, []);

  const filteredBills = bills.filter(b =>
    b.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.date.includes(searchTerm)
  );

  const groupedBills = filteredBills.reduce((acc, bill) => {
    const month = new Date(bill.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(bill);
    return acc;
  }, {} as Record<string, BillRecord[]>);

  // Convert groupedBills to an array of { month, bills } objects, sorted by month descending
  const monthGroups = Object.entries(groupedBills)
    .sort((a, b) => {
      // Sort by date descending
      const dateA = new Date(a[1][0].date);
      const dateB = new Date(b[1][0].date);
      return dateB.getTime() - dateA.getTime();
    })
    .map(([month, bills]) => ({ month, bills }));

  // Paginate month groups: each page contains whole months, up to billsPerPage bills per page
  const paginatedMonthGroups: { month: string, bills: BillRecord[] }[] = [];
  let count = 0;
  let pageStart = (currentPage - 1) * billsPerPage;
  let pageEnd = currentPage * billsPerPage;
  let currentCount = 0;
  for (let i = 0; i < monthGroups.length; i++) {
    const group = monthGroups[i];
    if (currentCount + group.bills.length > billsPerPage && currentCount > 0) {
      break;
    }
    paginatedMonthGroups.push(group);
    currentCount += group.bills.length;
  }

  // For pagination controls, calculate total pages
  // Each page contains whole months, so we need to split monthGroups into pages
  const pages: { month: string, bills: BillRecord[] }[][] = [];
  let temp: { month: string, bills: BillRecord[] }[] = [];
  let tempCount = 0;
  for (let i = 0; i < monthGroups.length; i++) {
    const group = monthGroups[i];
    if (tempCount + group.bills.length > billsPerPage && tempCount > 0) {
      pages.push(temp);
      temp = [];
      tempCount = 0;
    }
    temp.push(group);
    tempCount += group.bills.length;
  }
  if (temp.length > 0) {
    pages.push(temp);
  }
  const totalPages = pages.length;
  const billsToRender = pages[currentPage - 1] || [];

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const totalSpent = bills.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const lastMonthTotal = bills.reduce((acc, curr) => {
    // Simple last 30 days approximation
    const date = new Date(curr.date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 ? acc + (curr.total || 0) : acc;
  }, 0);

  return (
    <div className="min-h-screen pb-24 bg-gray-50 animate-fade-in">
      <Header
        title="BillScan"
      />

      <div className="px-6 max-w-7xl mx-auto space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <TrendingUp className="w-6 h-6 text-indigo-100" />
                    </div>
                    <div>
                    <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">Total Tracked</p>
                    <h2 className="text-2xl font-bold tracking-tight mt-1">{formatCurrency(totalSpent)}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-indigo-100 text-xs bg-white/10 p-1 px-2 rounded-md w-fit backdrop-blur-sm mt-2">
                    <Calendar className="w-3 h-3" />
                    <span>Last 30 days: {formatCurrency(lastMonthTotal)}</span>
                </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                <Receipt className="w-32 h-32 text-white" />
            </div>
            </Card>

            <div className="hidden md:flex flex-col justify-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Quick Actions</h3>
                <p className="text-gray-500 text-sm mb-3">Manage your expenses efficiently.</p>
                <div className="flex gap-4">
                     <Button onClick={() => navigate('/upload')} className="flex-1">
                        <Plus className="w-5 h-5 mr-2" /> Upload Receipt
                     </Button>
                     <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                     </div>
                </div>
            </div>
        </div>

        {/* Search for Mobile */}
        <div className="relative md:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search stores or dates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {/* Recent Bills List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Recent Bills</h3>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{filteredBills.length} found</span>
          </div>

          {filteredBills.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-lg">No bills found</p>
              <p className="text-sm text-gray-400 mt-1">Upload your first receipt to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(billsToRender).map(([month, billsInMonth]) => (
                <div key={month}>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 px-2">{month}</h4>
                  <div className="space-y-2">
                    {billsInMonth.map((bill) => (
                      <Card
                        key={bill.id}
                        onClick={() => navigate(`/bill/${bill.id}`)}
                        className="p-3 flex items-center gap-4 hover:bg-gray-50 transition-all duration-200 group"
                      >
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative border border-gray-200">
                          {bill.imageData ? (
                            <img src={bill.imageData} alt={bill.storeName} className="w-full h-full object-cover" />
                          ) : (
                            <Receipt className="w-8 h-8 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{bill.storeName}</h4>
                          <p className="text-sm text-gray-500">{formatDate(bill.date)}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 block text-lg">{formatCurrency(bill.total, bill.currency)}</span>
                          <span className="text-xs text-gray-500 group-hover:translate-x-1 transition-transform inline-block">View Details &rarr;</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {Math.ceil(paginatedBills.length / billsPerPage) > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {Array.from({ length: Math.ceil(paginatedBills.length / billsPerPage) }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 ${currentPage === number ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
                  >
                    {number}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (Mobile Only) */}
      <div className="fixed bottom-6 right-6 z-20 md:hidden">
        <button
          onClick={() => navigate('/upload')}
          className="w-14 h-14 bg-indigo-600 rounded-full shadow-xl hover:bg-indigo-700 flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-indigo-200"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
