import React, { useState } from 'react';
import { parsePdfFile } from './services/pdfParser';
import { ExtractedData } from './types';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import RawTextView from './components/RawTextView';
import Header from './components/Header';
import InstructionsPanel from './components/InstructionsPanel';

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [rawText, setRawText] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      setError('Por favor, selecione um arquivo PDF válido.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await parsePdfFile(file);
      setExtractedData(data);
      
      // Set raw text from the extracted data
      if (data.rawText) {
        setRawText(data.rawText.substring(0, 10000)); // Limit to first 10000 chars
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Ocorreu um erro ao processar o arquivo PDF. Verifique se o arquivo é válido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <InstructionsPanel />
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload do PDF</h2>
          <FileUpload 
            onFileLoaded={handleFileUpload} 
            isLoading={isLoading} 
            error={error} 
          />
        </div>
        
        {extractedData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Dados Extraídos</h2>
            <DataTable data={extractedData} />
            
            {rawText && (
              <RawTextView 
                text={rawText} 
                fileName={extractedData.fileName} 
              />
            )}
          </div>
        )}
      </main>
      
      <footer className="bg-gray-800 text-gray-300 py-6 px-4">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} Extrator de Dados de Planos de Saúde</p>
          <p className="text-sm mt-2">Desenvolvido para facilitar a análise de cotações de planos de saúde</p>
        </div>
      </footer>
    </div>
  );
}

export default App;