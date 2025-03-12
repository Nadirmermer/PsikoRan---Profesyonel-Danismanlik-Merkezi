export interface Question {
  id: string;
  text?: string;
  options: Array<{
    value: number;
    text: string;
  }>;
}

interface TestReport {
  totalScore: number;
  severityLevel: string;
  requiresTreatment: boolean;
  factorScores: Record<string, number>;
  factorAverages: Record<string, number>;
  riskFactors: string[];
  prominentSymptoms: Array<{
    question: number;
    severity: number;
    response?: string;
  }>;
  interpretation: {
    overall: string;
    factors: string;
    risks: string;
    symptoms: string;
    recommendations: string[];
  };
}

export interface Test {
  id: string;
  name: string;
  description: string;
  instructions?: string;
  infoText?: string;
  questions: Question[];
  calculateScore: (answers: Record<string, number>) => number;
  interpretScore: (score: number) => string;
  generateReport?: (answers: Record<string, number>) => TestReport;
} 