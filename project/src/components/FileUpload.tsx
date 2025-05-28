import React, { useState, useRef } from 'react';
import { FileUp, AlertCircle, Check } from 'lucide-react';

interface FileUploadProps {
  onFileLoaded: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded, isLoading, error }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        onFileLoaded(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        onFileLoaded(file);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors 
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          ${isLoading ? 'opacity-70 pointer-events-none' : ''}
          ${error ? 'border-red-300' : ''}
          ${selectedFile && !error && !isLoading ? 'border-green-300 bg-green-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleChange}
          disabled={isLoading}
        />
        
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Processando arquivo...</p>
          </div>
        ) : selectedFile && !error ? (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Check className="text-green-500 w-8 h-8" />
            </div>
            <p className="text-green-700 font-medium">{selectedFile.name}</p>
            <p className="text-gray-500 text-sm mt-1">
              {Math.round(selectedFile.size / 1024)} KB
            </p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertCircle className="text-red-500 w-8 h-8" />
            </div>
            <p className="text-red-700 font-medium">Erro ao processar o arquivo</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <button 
              onClick={handleButtonClick}
              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FileUp className="text-blue-500 w-6 h-6" />
            </div>
            <p className="text-gray-700 font-medium">Arraste seu arquivo PDF aqui</p>
            <p className="text-gray-500 text-sm text-center mt-1 mb-4">
              ou clique para selecionar
            </p>
            <button 
              onClick={handleButtonClick}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              Selecionar arquivo PDF
            </button>
          </>
        )}
      </div>
      
      {!error && selectedFile && !isLoading && (
        <div className="mt-2 text-center">
          <button 
            onClick={handleButtonClick}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            Escolher outro arquivo
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;