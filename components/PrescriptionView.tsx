/**
 * Prescription View Component
 * Displays the final prescription with export and print options
 */

'use client';

import React from 'react';
import { PrescriptionData } from '@/types';
import ModernTemplate from './templates/ModernTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import { exportToPDF, printPrescription } from '@/lib/pdfExport';
import { Download, Printer, ArrowLeft } from 'lucide-react';

interface PrescriptionViewProps {
  prescription: PrescriptionData;
  onBack: () => void;
}

export default function PrescriptionView({ prescription, onBack }: PrescriptionViewProps) {
  const [isExporting, setIsExporting] = React.useState(false);
         
  const renderTemplate = () => {
    switch (prescription.templateId) {
      case 'modern':
        return <ModernTemplate data={prescription} />;
      case 'classic':
        return <ClassicTemplate data={prescription} />;
      case 'minimal':
        return <MinimalTemplate data={prescription} />;
      default:
        return <ModernTemplate data={prescription} />;
    }
  };

  
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const fileName = `prescription_${prescription.patient.name.replace(/\s+/g, '_')}_${
        new Date().toISOString().split('T')[0]
      }.pdf`;
      await exportToPDF('prescription-content', fileName);
    } catch (error) {
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    printPrescription();
  };

  return (
    <div className="animate-fadeIn">
      {/* Action Bar */}
      <div className="no-print mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="btn-outline flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Prescription Content */}
      <div className="bg-gray-100 p-8 rounded-lg">
        {renderTemplate()}
      </div>

      {/* Footer Info */}
      <div className="no-print mt-6 text-center text-sm text-gray-500">
        <p>Prescription generated on {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
