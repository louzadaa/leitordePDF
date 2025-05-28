import { saveAs } from 'file-saver';
import { ExtractedData } from '../types';

export const exportToCSV = (data: ExtractedData): void => {
  // Create CSV header
  const headers = [
    'Plano',
    'Tipo do Plano',
    'Tipo de Cobertura',
    'Acomodação',
    'Faixas Etárias e Valores',
    'Rede Credenciada',
    'Coparticipações',
    'Área de Atuação',
    'Informações Adicionais',
  ];

  // Create CSV rows from data
  const rows = data.plans.map((plan) => {
    const ageRangesStr = plan.ageRanges
      .map(range => `${range.minAge}-${range.maxAge || '59+'}: R$ ${range.price.toFixed(2)}`)
      .join(' | ');

    return [
      `"${plan.planName.replace(/"/g, '""')}"`,
      `"${plan.planType}"`,
      `"${plan.coverageType}"`,
      `"${plan.accommodation}"`,
      `"${ageRangesStr.replace(/"/g, '""')}"`,
      `"${plan.network.replace(/"/g, '""')}"`,
      `"${plan.coPayments.replace(/"/g, '""')}"`,
      `"${plan.coverageArea.replace(/"/g, '""')}"`,
      `"${plan.additionalInfo?.replace(/"/g, '""') || ''}"`,
    ];
  });

  // Combine header and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // Create Blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `planos-saude-${data.timestamp}.csv`);
};