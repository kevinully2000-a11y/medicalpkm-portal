// AMA/ABMS-recognized medical specialties
// Source: American Board of Medical Specialties (ABMS) member boards
export const AMA_SPECIALTIES = [
  'Addiction Medicine',
  'Adolescent Medicine',
  'Allergy and Immunology',
  'Anesthesiology',
  'Cardiovascular Disease',
  'Child and Adolescent Psychiatry',
  'Clinical Cardiac Electrophysiology',
  'Clinical Neurophysiology',
  'Colon and Rectal Surgery',
  'Critical Care Medicine',
  'Dermatology',
  'Developmental-Behavioral Pediatrics',
  'Diagnostic Radiology',
  'Emergency Medicine',
  'Endocrinology, Diabetes and Metabolism',
  'Family Medicine',
  'Gastroenterology',
  'Geriatric Medicine',
  'Gynecologic Oncology',
  'Hand Surgery',
  'Hematology',
  'Hospice and Palliative Medicine',
  'Hospital Medicine',
  'Infectious Disease',
  'Internal Medicine',
  'Interventional Cardiology',
  'Maternal-Fetal Medicine',
  'Medical Genetics and Genomics',
  'Medical Oncology',
  'Medical Toxicology',
  'Neonatal-Perinatal Medicine',
  'Nephrology',
  'Neurological Surgery',
  'Neurology',
  'Neuromuscular Medicine',
  'Nuclear Medicine',
  'Obstetrics and Gynecology',
  'Ophthalmology',
  'Orthopaedic Surgery',
  'Otolaryngology – Head and Neck Surgery',
  'Pain Medicine',
  'Pathology',
  'Pediatric Cardiology',
  'Pediatric Critical Care Medicine',
  'Pediatric Emergency Medicine',
  'Pediatric Endocrinology',
  'Pediatric Gastroenterology',
  'Pediatric Hematology-Oncology',
  'Pediatric Hospital Medicine',
  'Pediatric Infectious Diseases',
  'Pediatric Nephrology',
  'Pediatric Pulmonology',
  'Pediatric Rheumatology',
  'Pediatric Surgery',
  'Pediatrics',
  'Physical Medicine and Rehabilitation',
  'Plastic Surgery',
  'Preventive Medicine',
  'Psychiatry',
  'Pulmonary Disease',
  'Radiation Oncology',
  'Radiology',
  'Reproductive Endocrinology and Infertility',
  'Rheumatology',
  'Sleep Medicine',
  'Sports Medicine',
  'Surgery',
  'Surgical Critical Care',
  'Thoracic Surgery',
  'Transplant Hepatology',
  'Undersea and Hyperbaric Medicine',
  'Urology',
  'Vascular Surgery',
] as const;

export type AmaSpecialty = (typeof AMA_SPECIALTIES)[number];

const specialtySet = new Set(
  AMA_SPECIALTIES.map((s) => s.toLowerCase())
);

// Common aliases mapping to canonical AMA specialty names
const ALIASES: Record<string, string> = {
  cardiology: 'Cardiovascular Disease',
  'interventional cardiology': 'Interventional Cardiology',
  gi: 'Gastroenterology',
  'gastroenterology and hepatology': 'Gastroenterology',
  hepatology: 'Transplant Hepatology',
  onc: 'Medical Oncology',
  oncology: 'Medical Oncology',
  'hematology/oncology': 'Hematology',
  'heme/onc': 'Hematology',
  id: 'Infectious Disease',
  'infectious diseases': 'Infectious Disease',
  neuro: 'Neurology',
  pulm: 'Pulmonary Disease',
  'pulmonary and critical care': 'Pulmonary Disease',
  'pulmonary medicine': 'Pulmonary Disease',
  endo: 'Endocrinology, Diabetes and Metabolism',
  endocrinology: 'Endocrinology, Diabetes and Metabolism',
  rheum: 'Rheumatology',
  neph: 'Nephrology',
  derm: 'Dermatology',
  psych: 'Psychiatry',
  'ob/gyn': 'Obstetrics and Gynecology',
  obgyn: 'Obstetrics and Gynecology',
  'general surgery': 'Surgery',
  'general internal medicine': 'Internal Medicine',
  'palliative care': 'Hospice and Palliative Medicine',
  'palliative medicine': 'Hospice and Palliative Medicine',
  geriatrics: 'Geriatric Medicine',
  hospitalist: 'Hospital Medicine',
};

export function classifySpecialty(
  term: string
): { type: 'specialty' | 'focusArea'; label: string } {
  const lower = term.trim().toLowerCase();

  // Direct match
  if (specialtySet.has(lower)) {
    const match = AMA_SPECIALTIES.find((s) => s.toLowerCase() === lower);
    return { type: 'specialty', label: match! };
  }

  // Alias match
  if (ALIASES[lower]) {
    return { type: 'specialty', label: ALIASES[lower] };
  }

  // Partial match — check if the term contains a known specialty
  for (const s of AMA_SPECIALTIES) {
    if (lower.includes(s.toLowerCase()) || s.toLowerCase().includes(lower)) {
      return { type: 'specialty', label: s };
    }
  }

  // Not a recognized AMA specialty → focus area
  return { type: 'focusArea', label: term.trim() };
}

// Classify an array of terms into specialties and focus areas
export function classifyTerms(terms: string[]): {
  specialties: string[];
  focusAreas: string[];
} {
  const specialties: string[] = [];
  const focusAreas: string[] = [];

  for (const term of terms) {
    const result = classifySpecialty(term);
    if (result.type === 'specialty') {
      if (!specialties.includes(result.label)) specialties.push(result.label);
    } else {
      if (!focusAreas.includes(result.label)) focusAreas.push(result.label);
    }
  }

  return { specialties, focusAreas };
}
