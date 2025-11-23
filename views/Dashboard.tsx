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
            <Card className="p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="w-8 h-8 text-indigo-100" />
                    </div>
                    <div>
                    <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider">Total Tracked</p>
                    <h2 className="text-4xl font-bold tracking-tight mt-1">{formatCurrency(totalSpent)}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-indigo-100 text-sm bg-white/10 p-2 px-3 rounded-lg w-fit backdrop-blur-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Last 30 days: {formatCurrency(lastMonthTotal)}</span>
                </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                <Receipt className="w-64 h-64 text-white" />
            </div>
            </Card>

            <div className="hidden md:flex flex-col justify-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Actions</h3>
                <p className="text-gray-500 mb-6">Manage your expenses efficiently. Upload receipts to track spending automatically.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBills.map((bill) => (
                <Card
                  key={bill.id}
                  onClick={() => navigate(`/bill/${bill.id}`)}
                  className="p-4 flex flex-col gap-4 hover:bg-gray-50 transition-all hover:-translate-y-1 duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative border border-gray-200">
                        {bill.imageData ? (
                            <img src={bill.imageData} alt={bill.storeName} className="w-full h-full object-cover" />
                        ) : (
                            <Receipt className="w-6 h-6 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        )}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{bill.storeName}</h4>
                            <p className="text-xs text-gray-500">{formatDate(bill.date)}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="font-bold text-gray-900 block text-lg">{formatCurrency(bill.total, bill.currency)}</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-auto border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                      <span>{bill.lineItems?.length || 0} items</span>
                      <span className="group-hover:translate-x-1 transition-transform">View Details &rarr;</span>
                  </div>
                </Card>
              ))}
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
