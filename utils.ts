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

export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
};
