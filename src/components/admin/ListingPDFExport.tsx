import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/i18n/useTranslation';
import { generateAndStorePDF } from '@/services/pdfService.tsx';
import { FileText, Download, RefreshCw, Loader2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ListingPDFExportProps {
  listingId: string;
  referenceId: string;
  pdfUrl: string | null;
  pdfGeneratedAt: string | null;
  onPdfGenerated?: (url: string) => void;
}

export const ListingPDFExport: React.FC<ListingPDFExportProps> = ({
  listingId,
  referenceId,
  pdfUrl,
  pdfGeneratedAt,
  onPdfGenerated,
}) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState(pdfUrl);
  const [currentGeneratedAt, setCurrentGeneratedAt] = useState(pdfGeneratedAt);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const url = await generateAndStorePDF(listingId);
      setCurrentPdfUrl(url);
      const generatedAt = new Date().toISOString();
      setCurrentGeneratedAt(generatedAt);

      toast({
        title: t('pdfExport', 'generateSuccess'),
        description: t('pdfExport', 'generateSuccessDescription'),
      });

      onPdfGenerated?.(url);
      window.open(url, '_blank');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: t('pdfExport', 'generateError'),
        description: error instanceof Error ? error.message : t('pdfExport', 'generateErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (currentPdfUrl) {
      window.open(currentPdfUrl, '_blank');
    }
  };

  const hasPdf = Boolean(currentPdfUrl);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('pdfExport', 'title')}
        </CardTitle>
        <CardDescription>{t('pdfExport', 'description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasPdf ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span>
                {t('pdfExport', 'generatedOn')}{' '}
                {currentGeneratedAt ? format(new Date(currentGeneratedAt), 'PPP p') : referenceId}
              </span>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleDownloadPDF} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                {t('pdfExport', 'downloadButton')}
              </Button>
              <Button onClick={handleGeneratePDF} variant="outline" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('pdfExport', 'regenerating')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('pdfExport', 'regenerateButton')}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('pdfExport', 'noPdfYet')}</p>
            <Button onClick={handleGeneratePDF} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('pdfExport', 'generating')}
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  {t('pdfExport', 'generateButton')}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ListingPDFExport;

