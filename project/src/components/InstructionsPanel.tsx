import React from 'react';
import { FileUp, Table, Download, Info } from 'lucide-react';

const InstructionsPanel: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Como utilizar</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 rounded-full p-2 mr-2">
              <FileUp className="text-blue-600 w-5 h-5" />
            </div>
            <h3 className="font-medium text-blue-800">1. Upload</h3>
          </div>
          <p className="text-sm text-gray-600">
            Faça upload da sua cotação de planos de saúde em formato PDF.
          </p>
        </div>
        
        <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
          <div className="flex items-center mb-2">
            <div className="bg-teal-100 rounded-full p-2 mr-2">
              <Info className="text-teal-600 w-5 h-5" />
            </div>
            <h3 className="font-medium text-teal-800">2. Extração</h3>
          </div>
          <p className="text-sm text-gray-600">
            O sistema extrairá automaticamente informações sobre planos, valores e coberturas.
          </p>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
          <div className="flex items-center mb-2">
            <div className="bg-amber-100 rounded-full p-2 mr-2">
              <Table className="text-amber-600 w-5 h-5" />
            </div>
            <h3 className="font-medium text-amber-800">3. Visualização</h3>
          </div>
          <p className="text-sm text-gray-600">
            Visualize os dados extraídos em formato tabulado com opções de ordenação e filtro.
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center mb-2">
            <div className="bg-green-100 rounded-full p-2 mr-2">
              <Download className="text-green-600 w-5 h-5" />
            </div>
            <h3 className="font-medium text-green-800">4. Exportação</h3>
          </div>
          <p className="text-sm text-gray-600">
            Exporte os dados extraídos para CSV para análise posterior em planilhas.
          </p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-2">Nota importante:</p>
        <p>
          A extração automática de dados de PDFs pode variar em precisão dependendo da estrutura e formatação do documento original. 
          Verifique sempre os dados extraídos e ajuste conforme necessário.
        </p>
      </div>
    </div>
  );
};

export default InstructionsPanel;