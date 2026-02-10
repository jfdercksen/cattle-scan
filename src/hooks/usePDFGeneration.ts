import { useCallback, useState } from 'react';
import { generateAndStorePDF, previewPDF as previewPdfBlob } from '@/services/pdfService.tsx';

export const usePDFGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generatePDF = useCallback(async (listingId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await generateAndStorePDF(listingId);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const previewPDF = useCallback(async (listingId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await previewPdfBlob(listingId);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generatePDF, previewPDF, isGenerating: loading, error };
};

