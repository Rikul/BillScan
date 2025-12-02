import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Receipt, TrendingUp, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { BillRecord, PaginatedBillsResponse, PaginationInfo } from "../types";
import { getBills } from "../services/storageService";
import { Button, Card, Header, Input } from "../components/UI";
import { formatCurrency, formatDate } from "../utils";
import FilterPanel, { FilterState, loadFiltersFromStorage } from "../components/FilterPanel";

type SortField = 'date' | 'storeName' | 'total' | 'tax' | 'subtotal';
type SortDirection = 'asc' | 'desc';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState<BillRecord[]>([]);
    const [allBills, setAllBills] = useState<BillRecord[]>([]); // For stats calculation
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [filters, setFilters] = useState<FilterState>(loadFiltersFromStorage);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const billsPerPage = 20;

    // Fetch bills from API with server-side filtering and pagination
    const fetchBills = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getBills({
                dateFrom: filters.dateFrom || undefined,
                dateTo: filters.dateTo || undefined,
                storeName: filters.storeName || undefined,
                minAmount: filters.minAmount || undefined,
                maxAmount: filters.maxAmount || undefined,
                searchTerm: searchTerm || undefined,
                page: currentPage,
                pageSize: billsPerPage,
                sortField,
                sortDirection
            });

            // Check if response is paginated (has pagination property)
            if (response && typeof response === 'object' && 'pagination' in response) {
                const paginatedResponse = response as PaginatedBillsResponse;
                setBills(paginatedResponse.bills);
                setPagination(paginatedResponse.pagination);
            } else {
                // Fallback for array response
                setBills(response as BillRecord[]);
                setPagination(null);
            }
        } catch (error) {
            console.error("Error fetching bills:", error);
        } finally {
            setIsLoading(false);
        }
    }, [filters, searchTerm, currentPage, sortField, sortDirection, billsPerPage]);

    // Fetch all bills for stats (without filters)
    const fetchAllBillsForStats = useCallback(async () => {
        try {
            const response = await getBills();
            if (Array.isArray(response)) {
                setAllBills(response);
            }
        } catch (error) {
            console.error("Error fetching all bills for stats:", error);
        }
    }, []);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    useEffect(() => {
        fetchAllBillsForStats();
    }, [fetchAllBillsForStats]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchTerm]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
        setCurrentPage(1); // Reset to first page when sorting
    };

    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
        }
        return sortDirection === 'asc' ?
            <ArrowUp className="w-4 h-4 text-indigo-600" /> :
            <ArrowDown className="w-4 h-4 text-indigo-600" />;
    };

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Calculate stats from all bills (without filters)
    const totalSpent = allBills.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const lastMonthTotal = allBills.reduce((acc, curr) => {
        const [year, month, day] = curr.date.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 ? acc + (curr.total || 0) : acc;
    }, 0);

    // Pagination values from server response
    const totalPages = pagination?.totalPages ?? 0;
    const totalCount = pagination?.totalCount ?? bills.length;

    return (
        <div className="min-h-screen pb-24 bg-gray-50 animate-fade-in">
            <Header title="BillScan" />

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
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search stores or dates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white"
                    />
                </div>

                {/* Filter Panel */}
                <FilterPanel filters={filters} onFiltersChange={setFilters} />

                {/* Bills Table */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {isLoading ? 'Loading...' : `${totalCount} found`}
                        </span>
                    </div>

                    {!isLoading && bills.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Receipt className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium text-lg">No bills found</p>
                            <p className="text-sm text-gray-400 mt-1">Upload your first receipt to get started</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                    Picture
                                                </th>
                                                <th
                                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                                    onClick={() => handleSort('date')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        Date
                                                        {renderSortIcon('date')}
                                                    </div>
                                                </th>
                                                <th
                                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                                    onClick={() => handleSort('storeName')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        Store
                                                        {renderSortIcon('storeName')}
                                                    </div>
                                                </th>
                                                <th
                                                    className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                                    onClick={() => handleSort('subtotal')}
                                                >
                                                    <div className="flex items-center justify-end gap-2">
                                                        Subtotal
                                                        {renderSortIcon('subtotal')}
                                                    </div>
                                                </th>
                                                <th
                                                    className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                                    onClick={() => handleSort('tax')}
                                                >
                                                    <div className="flex items-center justify-end gap-2">
                                                        Tax
                                                        {renderSortIcon('tax')}
                                                    </div>
                                                </th>
                                                <th
                                                    className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                                    onClick={() => handleSort('total')}
                                                >
                                                    <div className="flex items-center justify-end gap-2">
                                                        Total
                                                        {renderSortIcon('total')}
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {bills.map((bill) => (
                                                <tr
                                                    key={bill.id}
                                                    onClick={() => navigate(`/bill/${bill.id}`)}
                                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                                                            {bill.imagePath || bill.imageData ? (
                                                                <img
                                                                    src={bill.imagePath || bill.imageData}
                                                                    alt={bill.storeName}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Receipt className="w-6 h-6 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {formatDate(bill.date)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="font-medium text-gray-900">{bill.storeName}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                                                        {formatCurrency(bill.subtotal, bill.currency)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                                                        {formatCurrency(bill.tax, bill.currency)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="font-bold text-gray-900">
                                                            {formatCurrency(bill.total, bill.currency)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-2">
                                {bills.map((bill) => (
                                    <Card
                                        key={bill.id}
                                        onClick={() => navigate(`/bill/${bill.id}`)}
                                        className="p-3 flex items-center gap-4 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                                            {bill.imagePath || bill.imageData ? (
                                                <img
                                                    src={bill.imagePath || bill.imageData}
                                                    alt={bill.storeName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Receipt className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-gray-900">{bill.storeName}</h4>
                                            <p className="text-sm text-gray-500">{formatDate(bill.date)}</p>
                                            <div className="flex gap-3 mt-1 text-xs text-gray-600">
                                                <span>Subtotal: {formatCurrency(bill.subtotal, bill.currency)}</span>
                                                <span>Tax: {formatCurrency(bill.tax, bill.currency)}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-gray-900 block text-lg">
                                                {formatCurrency(bill.total, bill.currency)}
                                            </span>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                                    <div className="text-sm text-gray-600">
                                        Showing {((currentPage - 1) * billsPerPage) + 1} to {Math.min(currentPage * billsPerPage, totalCount)} of {totalCount} bills
                                    </div>
                                    <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => paginate(pageNum)}
                                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 ${currentPage === pageNum ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'text-gray-700'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </nav>
                                </div>
                            )}
                        </>
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