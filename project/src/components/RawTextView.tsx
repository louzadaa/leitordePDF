import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface RawTextViewProps {
  text: string;
  fileName: string;
}

const RawTextView: React.FC<RawTextViewProps> = ({ text, fileName }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="w-full mt-6 bg-white rounded-lg shadow-md overflow-hidden">
      <div 
        className="p-4 bg-gray-50 border-b flex items-center justify-between cursor-pointer"
        onClick={toggleExpand}
      >
        <h3 className="text-lg font-medium text-gray-700">Texto Original Extraído</h3>
        <button className="text-gray-500 hover:text-gray-700">
          {isExpanded ? 
            <ChevronUp className="w-5 h-5" /> : 
            <ChevronDown className="w-5 h-5" />
          }
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          <div className="mb-2 text-sm text-gray-500">
            Arquivo: {fileName}
          </div>
          <div className="bg-gray-50 p-4 rounded border overflow-auto max-h-96">
            <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700">
              {text || "Nenhum texto extraído"}
            </pre>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Esta é a representação em texto do conteúdo extraído do PDF. A qualidade da extração pode variar dependendo da estrutura do documento original.
          </p>
        </div>
      )}
    </div>
  );
};

export default RawTextView;