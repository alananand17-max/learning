import React, { useState, useEffect, useRef } from 'react';
import { Screen, CVData, Profile } from '../../types';
import ProgressRing from '../common/ProgressRing';
import Icon from '../common/Icon';
import { regenerateCV } from '../../services/aiService';

// Declare global variables loaded from script tags in index.html
declare const marked: { parse: (markdown: string) => string };
declare const jspdf: any;
declare const html2canvas: any;

interface CVPreviewScreenProps {
  cv: CVData;
  onNavigate: (screen: Screen) => void;
  onUpdateCV: (cv: CVData) => void;
  profile: Profile | null;
  isPro: boolean;
}

const CVPreviewScreen: React.FC<CVPreviewScreenProps> = ({ cv, onNavigate, onUpdateCV, profile, isPro }) => {
  const [currentCv, setCurrentCv] = useState<CVData>(cv);
  const [changeRequest, setChangeRequest] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const cvPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentCv(cv);
  }, [cv]);
  
  const handleRegenerate = async () => {
    if (!profile || !changeRequest.trim()) return;

    setIsRegenerating(true);
    setRegenerateError(null);

    try {
        const newMarkdown = await regenerateCV({
            originalMarkdown: currentCv.markdown,
            changeRequest,
            profile,
            jobDescription: currentCv.jobDescription,
        });

        const updatedCV: CVData = { ...currentCv, markdown: newMarkdown, generatedDate: new Date().toISOString() };
        onUpdateCV(updatedCV);
        setCurrentCv(updatedCV);
        setChangeRequest('');

    } catch (error: any) {
        setRegenerateError(error.message || 'Failed to regenerate CV.');
    } finally {
        setIsRegenerating(false);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const downloadMdFile = () => {
    const blob = new Blob([currentCv.markdown], { type: 'text/markdown;charset=utf-8' });
    downloadFile(blob, `cv_${currentCv.id}.md`);
  };

  const handlePdfDownloadClick = async () => {
    if (!isPro) {
        onNavigate('payment');
        return;
    }

    if (!cvPreviewRef.current) return;
    setIsGeneratingPdf(true);
    try {
        const { jsPDF } = jspdf;
        const canvas = await html2canvas(cvPreviewRef.current, { 
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth;
        const height = width / ratio;

        pdf.addImage(imgData, 'PNG', 0, 0, width, height > pdfHeight ? pdfHeight : height);
        pdf.save(`cv_${currentCv.id}.pdf`);

    } catch (error) {
        console.error("Failed to generate PDF:", error);
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 bg-dark-bg rounded-lg">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold">CV Generation Complete!</h2>
          <p className="text-dark-text-secondary">
            Review your generated CV and its estimated ATS score below.
          </p>
        </div>
        <div className="flex-shrink-0">
          <ProgressRing score={currentCv.atsScore} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column for source and changes */}
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Suggest Changes or Download</h3>
             <div className="p-4 bg-dark-bg rounded-lg space-y-4 border border-dark-border">
                <p className="text-sm text-dark-text-secondary">Not perfect? Describe what you'd like to change and let the AI regenerate it for you.</p>
                {regenerateError && <div className="p-3 my-2 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">{regenerateError}</div>}
                <textarea 
                    value={changeRequest}
                    onChange={(e) => setChangeRequest(e.target.value)}
                    placeholder="e.g., 'Make the summary more punchy.' or 'Add a project section about my mobile app.'"
                    className="w-full h-32 bg-dark-card border border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-brand-primary"
                    disabled={isRegenerating}
                />
                <button
                    onClick={handleRegenerate}
                    disabled={!changeRequest.trim() || isRegenerating || !profile}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-secondary text-white font-bold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isRegenerating ? <><Icon name="loader" className="w-5 h-5 animate-spin" /> Regenerating...</> : 'Regenerate with AI'}
                </button>
             </div>
             <div className="p-4 bg-dark-bg rounded-lg space-y-3 border border-dark-border">
                <div className="flex flex-col sm:flex-row gap-3">
                     <button
                        onClick={downloadMdFile}
                        className="flex-1 w-full flex items-center justify-center gap-2 px-6 py-3 bg-dark-border font-bold rounded-lg hover:bg-gray-600 transition-colors"
                        >
                        <Icon name="download" className="w-5 h-5"/>
                        Download .md
                    </button>
                    <button
                        onClick={handlePdfDownloadClick}
                        disabled={isGeneratingPdf}
                        className="flex-1 w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white font-bold rounded-lg relative disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors hover:bg-indigo-700"
                        >
                        {isGeneratingPdf ? (
                            <><Icon name="loader" className="w-5 h-5 animate-spin" /> Generating PDF...</>
                        ) : (
                            <><Icon name="download" className="w-5 h-5"/> Download .pdf</>
                        )}
                        {!isPro && <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">PRO</span>}
                    </button>
                </div>
                {!isPro && <p className="text-center text-sm text-dark-text-secondary">PDF downloads are a premium feature. Click to upgrade.</p>}
             </div>
        </div>
        {/* Right column for CV preview */}
        <div className="space-y-4">
             <h3 className="text-xl font-semibold">Live Preview</h3>
             <div className="border border-dark-border rounded-lg h-[700px] overflow-y-auto bg-gray-100 p-2">
                <div ref={cvPreviewRef} className="cv-preview-container" dangerouslySetInnerHTML={{ __html: marked.parse(currentCv.markdown || '') }} />
            </div>
        </div>
      </div>

      <div className="pt-4 text-center">
        <button
          onClick={() => onNavigate('home')}
          className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-3 bg-dark-border text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
        >
          <Icon name="home" className="w-5 h-5"/>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default CVPreviewScreen;