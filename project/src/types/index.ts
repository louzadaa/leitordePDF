export type AgeRange = {
  minAge: number;
  maxAge: number | null; // null represents 59+
  price: number;
};

export type PlanType = 'EMPRESARIAL' | 'ADESAO' | 'INDIVIDUAL';
export type CoverageType = 'AMBULATORIAL' | 'OBSTETRICA' | 'HOSPITALAR';
export type AccommodationType = 'ENFERMARIA' | 'APARTAMENTO' | 'NENHUMA';

export interface InsurancePlan {
  planName: string;
  planType: PlanType;
  coverageType: CoverageType;
  accommodation: AccommodationType;
  ageRanges: AgeRange[];
  network: string;
  coPayments: string;
  coverageArea: string;
  additionalInfo?: string;
}

export interface ExtractedData {
  plans: InsurancePlan[];
  timestamp: string;
  fileName: string;
  rawText?: string;
}