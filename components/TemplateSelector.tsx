/**
 * Template Selector Component
 * Allows users to preview and select from available prescription templates
 */

'use client';

import React, { useState } from 'react';
import { PrescriptionData, TemplateType } from '@/types';
import ModernTemplate from './templates/ModernTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import { Check, Eye } from 'lucide-react';

interface TemplateSelectorProps {
  prescriptionData: PrescriptionData;
  onTemplateSelect: (templateId: TemplateType) => void;
  onBack: () => void;
}

const templates = [
  {
    id: 'modern' as TemplateType,
    name: 'Modern',
    description: 'Clean and contemporary design with gradient header and card-based layout',
    preview: 'bg-gradient-to-r from-primary-600 to-primary-800',
  },
  {
    id: 'classic' as TemplateType,
    name: 'Classic',
    description: 'Traditional medical prescription with formal serif fonts and professional styling',
    preview: 'border-4 border-double border-gray-800',
  },
  {
    id: 'minimal' as TemplateType,
    name: 'Minimal',
    description: 'Clean and minimalist design with lots of whitespace and subtle colors',
    preview: 'border-l-4 border-gray-300',
  },
];

export default function TemplateSelector({
  prescriptionData,
  onTemplateSelect,
  onBack,
}: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const [previewMode, setPreviewMode] = useState(false);

  const handleSelect = (templateId: TemplateType) => {
    setSelectedTemplate(templateId);
  };

  const handleConfirm = () => {
    onTemplateSelect(selectedTemplate);
  };

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'modern':
        return <ModernTemplate data={prescriptionData} />;
      case 'classic':
        return <ClassicTemplate data={prescriptionData} />;
      case 'minimal':
        return <MinimalTemplate data={prescriptionData} />;
      default:
        return <ModernTemplate data={prescriptionData} />;
    }
  };

  if (previewMode) {
    return (
      <div className="animate-fadeIn">
        <div className="no-print mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Template Preview</h2>
          <button
            onClick={() => setPreviewMode(false)}
            className="btn-secondary"
          >
            Back to Selection
          </button>
        </div>
        <div className="bg-gray-100 p-8 rounded-lg">
          {renderTemplate()}
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Prescription Template</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleSelect(template.id)}
            className={`cursor-pointer border-2 rounded-lg p-6 transition-all ${
              selectedTemplate === template.id
                ? 'border-primary-600 bg-primary-50 shadow-lg'
                : 'border-gray-300 hover:border-primary-400 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">{template.name}</h3>
              {selectedTemplate === template.id && (
                <div className="bg-primary-600 text-white rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
            
            {/* Visual Preview */}
            <div className={`h-32 rounded-lg mb-4 ${template.preview} flex items-center justify-center`}>
              <div className="text-center">
                <div className="bg-white bg-opacity-90 p-4 rounded shadow-sm">
                  <p className="text-xs text-gray-600 font-semibold">{template.name} Template</p>
                  <p className="text-xs text-gray-500 mt-1">Preview Style</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{template.description}</p>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTemplate(template.id);
                setPreviewMode(true);
              }}
              className="btn-outline w-full flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Full
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button onClick={onBack} className="btn-secondary">
          Back to Prescription Details
        </button>
        <button onClick={handleConfirm} className="btn-primary">
          Continue with {templates.find(t => t.id === selectedTemplate)?.name} Template
        </button>
      </div>
    </div>
  );
}
