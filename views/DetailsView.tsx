import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, Calendar, MapPin, Receipt as ReceiptIcon } from "lucide-react";
import { BillRecord } from "../types";
import { getBillById, deleteBill } from "../services/storageService";
import { Card, Header } from "../components/UI";
import { formatCurrency, formatDate } from "../utils";

const DetailsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bill, setBill] = useState<BillRecord | undefined>();

  useEffect(() => {
    if (id) {
      setBill(getBillById(id));
    }
  }, [id]);

  const handleBack = () => navigate('/');

  const handleDelete = () => {
    if (id && confirm("Are you sure you want to delete this bill?")) {
      deleteBill(id);
      navigate('/');
    }
  };

  if (!bill) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      <Header
        title="Bill Details"
        onBack={handleBack}
        action={
            <button onClick={handleDelete} className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors" title="Delete Bill">
                <Trash2 className="w-5 h-5" />
            </button>
        }
      />

      <div className="px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
            {/* Receipt Image Column */}
            <div className="md:w-1/2">
                <Card className="overflow-hidden sticky top-24">
                    <div className="aspect-[4/3] md:aspect-auto md:h-[calc(100vh-150px)] relative bg-gray-100 cursor-pointer group" onClick={() => window.open(bill.imageData, '_blank')}>
                        <img src={bill.imageData} alt={bill.storeName} className="w-full h-full object-contain bg-gray-900/5" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full transition-opacity backdrop-blur-sm">
                                Click to zoom
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Details Column */}
            <div className="md:w-1/2 space-y-6 pb-10">
                <Card className="p-6 space-y-6 shadow-md">
                    <div className="flex items-start justify-between border-b border-gray-100 pb-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1 uppercase tracking-wide font-semibold">Total Amount</p>
                            <h2 className="text-4xl font-bold text-gray-900">{formatCurrency(bill.total, bill.currency)}</h2>
                        </div>
                        <div className="text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 uppercase tracking-wide">
                                Processed
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Store</p>
                                <p className="text-lg text-gray-900 font-medium">{bill.storeName}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Date</p>
                                <p className="text-lg text-gray-900 font-medium">{formatDate(bill.date)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 text-sm border-t border-gray-100">
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-500 font-medium">Subtotal</span>
                            <span className="font-bold text-gray-900">{formatCurrency(bill.subtotal, bill.currency)}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-500 font-medium">Tax</span>
                            <span className="font-bold text-gray-900">{formatCurrency(bill.tax, bill.currency)}</span>
                        </div>
                    </div>
                </Card>

                {/* Line Items */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Items Purchased</h3>
                        <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{bill.lineItems?.length || 0}</span>
                    </div>
                    <div className="space-y-3">
                        {bill.lineItems && bill.lineItems.length > 0 ? (
                            bill.lineItems.map((item, idx) => (
                                <Card key={idx} className="p-4 flex justify-between items-center text-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <span className="bg-gray-100 text-gray-600 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {item.quantity}
                                        </span>
                                        <span className="text-gray-900 font-medium">{item.description}</span>
                                    </div>
                                    <span className="font-bold text-gray-700">
                                        {formatCurrency(item.price, bill.currency)}
                                    </span>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200 text-sm">
                                No individual items found on this receipt.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsView;
