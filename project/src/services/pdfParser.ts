import * as pdfjs from 'pdfjs-dist';
import { InsurancePlan, ExtractedData, PlanType, CoverageType, AccommodationType, AgeRange } from '../types';

// Set worker path for pdfjs
const pdfjsWorker = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url);
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker.toString();

// Enhanced pattern matching for better classification
function enhancedClassify(text: string, categories: string[], patterns: Record<string, RegExp[]>): string {
  text = text.toLowerCase();
  let maxScore = 0;
  let bestMatch = categories[0];

  for (const category of categories) {
    const categoryPatterns = patterns[category.toLowerCase()] || [new RegExp(category.toLowerCase(), 'g')];
    let score = 0;
    
    for (const pattern of categoryPatterns) {
      const matches = text.match(pattern) || [];
      score += matches.length;
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = category;
    }
  }

  return bestMatch;
}

function extractAgeRanges(text: string): AgeRange[] {
  const ageRanges: AgeRange[] = [];
  
  // Pattern for tabular format like in the image
  const tablePattern = /(\d+)\s*(?:a|até)\s*(\d+)\s*anos\s*R?\$\s*([\d.,]+)/gi;
  
  // Pattern for the last age group (59+ or similar)
  const seniorPattern = /(\d+)\s*(?:anos\s*>|anos\s*\+|\+\s*anos)\s*R?\$\s*([\d.,]+)/gi;
  
  // First try to match standard age ranges
  let match;
  while ((match = tablePattern.exec(text)) !== null) {
    const minAge = parseInt(match[1]);
    const maxAge = parseInt(match[2]);
    const price = parseFloat(match[3].replace('.', '').replace(',', '.'));
    ageRanges.push({ minAge, maxAge, price });
  }

  // Then try to match the senior age group
  while ((match = seniorPattern.exec(text)) !== null) {
    const minAge = parseInt(match[1]);
    const price = parseFloat(match[2].replace('.', '').replace(',', '.'));
    ageRanges.push({ minAge, maxAge: null, price }); // null maxAge indicates 59+
  }

  // If no matches found, try alternative patterns
  if (ageRanges.length === 0) {
    const alternativePatterns = [
      // Single age pattern
      /(\d+)\s*anos?:?\s*R?\$\s*([\d.,]+)/gi,
      // Range with dash
      /(\d+)-(\d+)\s*anos?:?\s*R?\$\s*([\d.,]+)/gi,
      // More specific patterns based on the image format
      /(\d+)\s*(?:a|até)\s*(\d+)\s*anos\s*R\$\s*([\d.,]+)/gi,
    ];

    for (const pattern of alternativePatterns) {
      while ((match = pattern.exec(text)) !== null) {
        if (match.length === 3) { // Single age format
          const age = parseInt(match[1]);
          const price = parseFloat(match[2].replace('.', '').replace(',', '.'));
          ageRanges.push({ minAge: age, maxAge: age, price });
        } else { // Range format
          const minAge = parseInt(match[1]);
          const maxAge = parseInt(match[2]);
          const price = parseFloat(match[3].replace('.', '').replace(',', '.'));
          ageRanges.push({ minAge, maxAge, price });
        }
      }
    }
  }

  return ageRanges.sort((a, b) => a.minAge - b.minAge);
}

function extractPlanCode(text: string): string {
  const patterns = [
    /(\d{6}\/\d{2}-\d)/i,
    /código:?\s*(\d+(?:[-/]\d+)*)/i,
    /registro\s*ans:?\s*(\d+(?:[-/]\d+)*)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return '';
}

function determinePlanType(text: string): PlanType {
  const patterns = {
    'empresarial': [
      /empres[aá]ri[ao]/gi,
      /pj|pessoa\s*jur[ií]dica/gi,
      /cnpj/gi
    ],
    'adesao': [
      /ades[ãa]o/gi,
      /associa[cç][ãa]o/gi,
      /sindicato/gi
    ],
    'individual': [
      /individual/gi,
      /pessoa\s*f[ií]sica/gi,
      /familiar/gi
    ]
  };

  return enhancedClassify(text, ['EMPRESARIAL', 'ADESAO', 'INDIVIDUAL'], patterns) as PlanType;
}

function determineCoverageType(text: string): CoverageType {
  // Look for specific coverage codes like A+H+OB
  const coverageCode = text.match(/[AH]\s*\+\s*[AH]\s*\+?\s*OB|AMBULATORIAL/i);
  if (coverageCode) {
    const code = coverageCode[0].toUpperCase();
    if (code.includes('OB')) return 'OBSTETRICA';
    if (code.includes('H')) return 'HOSPITALAR';
    return 'AMBULATORIAL';
  }

  const patterns = {
    'ambulatorial': [
      /ambulatorial/gi,
      /consultas?/gi,
      /exames?/gi
    ],
    'obstetrica': [
      /obst[eé]tri[co]/gi,
      /parto/gi,
      /maternidade/gi,
      /pr[ée]-natal/gi
    ],
    'hospitalar': [
      /hospitalar/gi,
      /interna[cç][ãa]o/gi,
      /cirurgia/gi
    ]
  };

  return enhancedClassify(text, ['AMBULATORIAL', 'OBSTETRICA', 'HOSPITALAR'], patterns) as CoverageType;
}

function determineAccommodationType(text: string): AccommodationType {
  // First check for explicit mentions in the table
  if (text.match(/sem\s*acomoda[çc][ãa]o/i)) return 'NENHUMA';
  if (text.match(/enfermaria/i)) return 'ENFERMARIA';
  if (text.match(/apartamento/i)) return 'APARTAMENTO';

  const patterns = {
    'enfermaria': [
      /enfermaria/gi,
      /quarto\s*coletivo/gi,
      /acomoda[cç][ãa]o\s*coletiva/gi
    ],
    'apartamento': [
      /apartamento/gi,
      /quarto\s*individual/gi,
      /quarto\s*privativo/gi
    ],
    'nenhuma': [
      /sem\s*acomoda[cç][ãa]o/gi,
      /n[ãa]o\s*possui\s*acomoda[cç][ãa]o/gi
    ]
  };

  return enhancedClassify(text, ['ENFERMARIA', 'APARTAMENTO', 'NENHUMA'], patterns) as AccommodationType;
}

function extractNetworkInfo(text: string): string {
  const patterns = [
    /rede(?:\s*credenciada)?:?\s*([^.]+)/i,
    /hospitais?(?:\s*credenciados?)?:?\s*([^.]+)/i,
    /cl[ií]nicas?(?:\s*credenciadas?)?:?\s*([^.]+)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return 'Rede não identificada';
}

function extractCoPayments(text: string): string {
  const patterns = [
    /coparticipa[çc][ãa]o:?\s*([^.]+)/i,
    /percentual\s*de\s*pagamento:?\s*([^.]+)/i,
    /valor\s*de\s*participa[çc][ãa]o:?\s*([^.]+)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return 'Coparticipações não identificadas';
}

function extractCoverageArea(text: string): string {
  const patterns = [
    /(área|area)\s*de\s*atua[çc][ãa]o:?\s*([^.]+)/i,
    /abrang[êe]ncia:?\s*([^.]+)/i,
    /cobertura\s*territorial:?\s*([^.]+)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[2]) {
      return match[2].trim();
    }
  }

  return 'Área não identificada';
}

function extractPlanName(section: string, index: number): string {
  // First try to find a plan code
  const planCode = extractPlanCode(section);
  
  // Then look for a descriptive name
  const patterns = [
    /plano:?\s*([^.]+)/i,
    /produto:?\s*([^.]+)/i,
    /nome\s*do\s*plano:?\s*([^.]+)/i
  ];

  for (const pattern of patterns) {
    const match = section.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      return planCode ? `${name} (${planCode})` : name;
    }
  }

  return planCode ? `Plano ${planCode}` : `Plano ${index}`;
}

export async function parsePdfFile(file: File): Promise<ExtractedData> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    let textContent = '';
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => 'str' in item ? item.str : '')
        .join(' ');
      textContent += pageText + ' ';
    }
    
    const plans = await extractPlansFromText(textContent);
    
    return {
      plans,
      timestamp: new Date().toISOString(),
      fileName: file.name,
      rawText: textContent
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Falha ao processar o arquivo PDF. Verifique se o arquivo é válido.');
  }
}

async function extractPlansFromText(text: string): Promise<InsurancePlan[]> {
  const plans: InsurancePlan[] = [];
  
  // Try to identify table headers first
  const tableHeaders = text.match(/(?:plano|produto|código|registro)\s*(?:\d+(?:[-/]\d+)*)?/gi) || [];
  
  // Split text into sections based on table headers or plan identifiers
  const sections = text.split(new RegExp(tableHeaders.join('|'), 'i'))
    .filter(section => section.trim().length > 10);
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    
    // Skip sections that don't appear to contain plan information
    if (!section.match(/R\$\s*[\d.,]+/)) continue;
    
    const planName = extractPlanName(section, i + 1);
    const planType = determinePlanType(section);
    const coverageType = determineCoverageType(section);
    const accommodation = determineAccommodationType(section);
    const ageRanges = extractAgeRanges(section);
    const network = extractNetworkInfo(section);
    const coPayments = extractCoPayments(section);
    const coverageArea = extractCoverageArea(section);
    
    plans.push({
      planName,
      planType,
      coverageType,
      accommodation,
      ageRanges,
      network,
      coPayments,
      coverageArea,
      additionalInfo: section.slice(0, 150).trim() + '...'
    });
  }
  
  // If no plans were found through table parsing, try to extract from the whole text
  if (plans.length === 0) {
    const ageRanges = extractAgeRanges(text);
    if (ageRanges.length > 0) {
      plans.push({
        planName: extractPlanName(text, 1),
        planType: determinePlanType(text),
        coverageType: determineCoverageType(text),
        accommodation: determineAccommodationType(text),
        ageRanges,
        network: extractNetworkInfo(text),
        coPayments: extractCoPayments(text),
        coverageArea: extractCoverageArea(text),
        additionalInfo: text.slice(0, 150).trim() + '...'
      });
    }
  }
  
  return plans;
}