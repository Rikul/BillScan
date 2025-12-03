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
