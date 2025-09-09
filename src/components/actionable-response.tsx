'use client';

import { Button } from './ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import type html2pdf from 'html2pdf.js';

interface ActionableResponseProps {
  htmlContent: string;
}

export function ActionableResponse({ htmlContent }: ActionableResponseProps) {
  const [h2p, setH2p] = useState<typeof html2pdf | null>(null);

  useEffect(() => {
    import('html2pdf.js').then(module => {
      setH2p(() => module.default);
    });
  }, []);

  const openInNewTab = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const downloadPdf = () => {
    if (!h2p) return;

    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    // A4 paper size
    element.style.width = '210mm';
    element.style.minHeight = '297mm';

    const opt = {
      margin: 10,
      filename: `report-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    h2p().set(opt).from(element).save();
  };

  return (
    <div>
      <div className="html-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={openInNewTab}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in New Tab
        </Button>
        <Button variant="outline" size="sm" onClick={downloadPdf} disabled={!h2p}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
