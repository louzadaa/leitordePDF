import React, { useState } from 'react';
import { Download, SortAsc, SortDesc, Search } from 'lucide-react';
import { ExtractedData, InsurancePlan } from '../types';
import { exportToCSV } from '../utils/csvExport';

interface DataTableProps {
  data: ExtractedData | null;
}

type SortField = keyof InsurancePlan;
type SortDirection = 'asc' | 'desc';

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [sortField, setSortField] = useState<SortField>('planName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  if (!data || data.plans.length === 0) {
    return null;
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' 
      ? <SortAsc className="inline-block ml-1 w-4 h-4" /> 
      : <SortDesc className="inline-block ml-1 w-4 h-4" />;
  };

  // Filter and sort data
  const filteredAndSortedPlans = [...data.plans]
    .filter(plan => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        plan.planName.toLowerCase().includes(searchLower) ||
        plan.price.toLowerCase().includes(searchLower) ||
        plan.network.toLowerCase().includes(searchLower) ||
        plan.coPayments.toLowerCase().includes(searchLower) ||
        plan.coverageArea.toLowerCase().includes(searchLower) ||
        (plan.additionalInfo && plan.additionalInfo.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      const aValue = String(a[sortField]).toLowerCase();
      const bValue = String(b[sortField]).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

  const handleExportCSV = () => {
    exportToCSV(data);
  };

  return (
    <div className="w-full overflow-hidden rounded-lg shadow-md">
      <div className="p-4 bg-white border-b flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Buscar planos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Exportar CSV</span>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('planName')}
              >
                <span className="flex items-center">
                  Plano
                  {getSortIcon('planName')}
                </span>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('price')}
              >
                <span className="flex items-center">
                  Valor
                  {getSortIcon('price')}
                </span>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('network')}
              >
                <span className="flex items-center">
                  Rede Credenciada
                  {getSortIcon('network')}
                </span>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('coPayments')}
              >
                <span className="flex items-center">
                  Coparticipações
                  {getSortIcon('coPayments')}
                </span>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('coverageArea')}
              >
                <span className="flex items-center">
                  Área de Atuação
                  {getSortIcon('coverageArea')}
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedPlans.map((plan, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{plan.planName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{plan.price}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{plan.network}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{plan.coPayments}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{plan.coverageArea}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredAndSortedPlans.length === 0 && (
        <div className="text-center py-8 bg-white">
          <p className="text-gray-500">Nenhum plano encontrado com os critérios de busca.</p>
        </div>
      )}
      
      <div className="bg-gray-50 px-4 py-3 border-t text-xs text-gray-500">
        Arquivo: {data.fileName} • Extraído em: {new Date(data.timestamp).toLocaleString('pt-BR')}
      </div>
    </div>
  );
};

export default DataTable;