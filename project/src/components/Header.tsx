import React from 'react';
import { FileText } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 px-4 shadow-md">
      <div className="container mx-auto flex items-center">
        <FileText className="w-8 h-8 mr-3" />
        <div>
          <h1 className="text-2xl font-bold">Extrator de Dados de Planos de Saúde</h1>
          <p className="text-blue-100">Transforme PDFs em dados tabulados para análise</p>
        </div>
      </div>
    </header>
  );
};

export default Header;