// Helper to resize image before storing to avoid LocalStorage limits
export const resizeImage = (file: File, maxWidth = 1500): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const elem = document.createElement('canvas');
                const scaleFactor = maxWidth / img.width;

                // Only resize if larger than maxWidth
                if (scaleFactor < 1) {
                    elem.width = maxWidth;
                    elem.height = img.height * scaleFactor;
                } else {
                    elem.width = img.width;
                    elem.height = img.height;
                }

                const ctx = elem.getContext('2d');
                ctx?.drawImage(img, 0, 0, elem.width, elem.height);
                resolve(ctx?.canvas.toDataURL('image/jpeg', 1) || '');
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

// Generate a UUID v4
export const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback UUID v4 implementation for environments that don't support crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

export const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        // Parse YYYY-MM-DD as local date components to avoid UTC shifts
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        return dateString;
    }
};

export const getMonthYearFromDateString = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    } catch (e) {
        return 'Unknown';
    }
};

// Convert bills data to CSV format
export const convertToCSV = (data: any[]): string => {
    if (data.length === 0) {
        return '';
    }

    // Define headers
    const headers = ['Date', 'Store Name', 'Subtotal', 'Tax', 'Total', 'Currency'];
    
    // Convert data rows
    const rows = data.map(bill => [
        bill.date,
        bill.storeName,
        bill.subtotal,
        bill.tax,
        bill.total,
        bill.currency || 'USD'
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
            // Escape cells that contain commas or quotes
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
        }).join(','))
    ].join('\n');

    return csvContent;
};

// Download CSV file
export const downloadCSV = (csvContent: string, filename: string): void => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
