export interface Question {
  id: string;
  text?: string;
  options: Array<{
    value: number;
    text: string;
  }>;
  moduleId?: string;
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  questions?: string[];
}

export interface TestReport {
  score: number;
  factorAverages: Record<string, number>;
  factorScores?: Record<string, number>;
  factorNoScores?: Record<string, number>;
  factorUnknownCounts?: Record<string, number>;
  severityLevel: string;
  requiresTreatment: boolean;
  riskFactors: string[];
  solvedModules?: string[];
  chartData?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: { r: number; g: number; b: number };
    }>;
  };
  pieChartData?: Array<{
    moduleName: string;
    data: number[];
    colors: Array<{ r: number; g: number; b: number }>;
  }>;
}

export interface Test {
  id: string;
  name: string;
  description: string;
  instructions?: string;
  infoText?: string;
  questions: Question[];
  modules?: Module[];
  isModular?: boolean;
  calculateScore: (answers: Record<string, number>) => number;
  interpretScore: (score: number) => string;
  generateReport?: (answers: Record<string, number>) => TestReport;
} 