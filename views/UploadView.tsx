import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Check, AlertCircle, ScanLine } from "lucide-react";
import { extractBillData } from "../services/aiService";
import { saveBill } from "../services/storageService";
import { resizeImage, formatCurrency } from "../utils";
import { BillData } from "../types";
import { Button, Card, Header, Input, Label } from "../components/UI";

const UploadView: React.FC = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [data, setData] = useState<BillData | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsAnalyzing(true);
        setError(null);

        // Resize first to save localstorage space and speed up upload
        const resizedImage = await resizeImage(file);
        setImage(resizedImage);

        // Process with configured AI service
        const result = await extractBillData(resizedImage);
        initializeRecord(result, resizedImage);
      } catch (err) {
        console.error(err);
        setError("Could not analyze receipt. Please try again or enter details manually.");
        // If analysis fails, we still let user enter manual data
        const emptyData = {
          storeName: "",
          date: new Date().toISOString().split('T')[0],
          total: 0,
          tax: 0,
          subtotal: 0,
          lineItems: []
        };
        // We need the image even if analysis failed to initialize the record
        if (image) initializeRecord(emptyData, image);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const initializeRecord = async (initialData: BillData, imgData: string) => {
    const newId = crypto.randomUUID();
    const created = new Date().toISOString();

    setData(initialData);
    setRecordId(newId);
    setCreatedAt(created);

    // Autosave immediately
    try {
      await saveBill({
        ...initialData,
        id: newId,
        imageData: imgData,
        createdAt: created,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save bill", e);
    }
  };

  const updateField = (field: keyof BillData, value: any) => {
    if (!data || !recordId || !image || !createdAt) return;

    let newData = { ...data, [field]: value };

    // Auto-calculate Total if Subtotal or Tax changes
    if (field === 'subtotal' || field === 'tax') {
        const sub = field === 'subtotal' ? (parseFloat(value) || 0) : (data.subtotal || 0);
        const tax = field === 'tax' ? (parseFloat(value) || 0) : (data.tax || 0);
        // Round to 2 decimal places to avoid float math issues
        newData.total = Math.round((sub + tax) * 100) / 100;
    }

    setData(newData);

    // Autosave on change
    saveBill({
      ...newData,
      id: recordId,
      imageData: image,
      createdAt: createdAt,
    }).catch(err => console.error("Autosave failed", err));
  };

  const handleBack = () => navigate('/');
  const handleUploadAnother = () => {
    window.location.reload();
    //setImage(null);
    //setData(null);
    //setRecordId(null);
    //setCreatedAt(null);
    //setError(null);
    //setIsSaved(false);
  }


  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
            <ScanLine className="w-10 h-10 text-indigo-600 animate-bounce" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing Receipt...</h2>
        <p className="text-gray-500 max-w-xs">Using the model to extract store details, dates, and line items.</p>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <Header title="Upload Receipt" onBack={handleBack} />
        <div className="p-6 flex flex-col h-[calc(100vh-100px)] items-center justify-center">
          <Card
            className="w-full max-w-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-12 bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Camera className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Take a Photo</h3>
            <p className="text-gray-500 text-center mb-8 max-w-sm">Upload a clear image of your receipt to automatically extract details.</p>
            <Button variant="primary" className="px-8">Select Image</Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
            />
          </Card>
          <div className="mt-8 text-center text-sm text-gray-400">
            Supported formats: JPG, PNG
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in">
      <Header
        title="Verify Details"
        onBack={handleBack}
        action={
        <div className="text-sm text-gray-500">
          <Button onClick={handleBack} variant="primary">
             {isSaved ? <span className="flex items-center"><Check className="w-4 h-4 mr-1"/> Saved</span> : "Done"}
          </Button>
          <Button onClick={handleUploadAnother} variant="secondary" className="ml-3">
                Upload Next Receipt
          </Button>
        </div>
        }
      />

      <div className="px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
            {/* Image Preview - Left Side on Desktop */}
            <div className="md:w-1/2 md:h-[calc(100vh-120px)] md:sticky md:top-24">
                <div className="relative h-64 md:h-full rounded-xl overflow-hidden bg-gray-900 shadow-inner group border border-gray-200">
                <img src={image} alt="Receipt" className="w-full h-full object-contain bg-gray-900/50" />
                <div className="absolute bottom-3 right-3">
                    <button
                        onClick={() => window.open(image, '_blank')}
                        className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm hover:bg-black/70"
                    >
                        View Full Image
                    </button>
                </div>
                </div>
                 {error && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">{error}</p>
                    </div>
                )}
            </div>

            {/* Form - Right Side on Desktop */}
            <div className="md:w-1/2 space-y-6 pb-10">
                {data && (
                <div className="space-y-6 animate-slide-up">
                    <Card className="p-6 space-y-5 shadow-md">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Receipt Details</h3>
                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Autosave On</span>
                        </div>

                        <div>
                            <Label>Store Name</Label>
                            <Input
                            value={data.storeName}
                            onChange={(e) => updateField('storeName', e.target.value)}
                            placeholder="e.g. Walmart"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Date</Label>
                                <Input
                                type="date"
                                value={data.date}
                                onChange={(e) => updateField('date', e.target.value)}
                                />
                            </div>
                             <div>
                                <Label>Currency</Label>
                                <Input
                                value={data.currency || 'USD'}
                                onChange={(e) => updateField('currency', e.target.value)}
                                placeholder="USD"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div>
                                <Label>Subtotal</Label>
                                <Input
                                type="number"
                                step="0.01"
                                value={data.subtotal || ''}
                                onChange={(e) => updateField('subtotal', e.target.value)}
                                placeholder="0.00"
                                />
                            </div>
                            <div>
                                <Label>Tax</Label>
                                <Input
                                type="number"
                                step="0.01"
                                value={data.tax || ''}
                                onChange={(e) => updateField('tax', e.target.value)}
                                placeholder="0.00"
                                />
                            </div>
                        </div>

                         <div className="pt-2">
                            <Label>Total Amount (Subtotal + Tax)</Label>
                            <Input
                            type="number"
                            step="0.01"
                            value={data.total}
                            onChange={(e) => updateField('total', parseFloat(e.target.value) || 0)}
                            className="font-bold text-lg text-indigo-600"
                            />
                        </div>
                    </Card>

                    {/* Line Items Preview */}
                    <div>
                    <Label className="mb-3 block px-1">Extracted Items ({data.lineItems?.length || 0})</Label>
                    <div className="space-y-2">
                        {data.lineItems?.map((item, idx) => (
                        <Card key={idx} className="p-4 flex justify-between items-center text-sm hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 truncate">{item.description}</p>
                                <p className="text-gray-500 text-xs mt-0.5">Qty: {item.quantity}</p>
                            </div>
                            <span className="font-mono font-semibold text-gray-700 ml-4">
                                {formatCurrency(item.price, data.currency)}
                            </span>
                        </Card>
                        ))}
                        {(!data.lineItems || data.lineItems.length === 0) && (
                            <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl">
                                <p className="text-sm text-gray-400">No line items detected automatically.</p>
                            </div>
                        )}
                    </div>
                    </div>
                </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UploadView;
