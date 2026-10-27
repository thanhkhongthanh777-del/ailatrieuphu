export interface Student {
  id: string;
  number: number;
  name: string;
  gender?: 'male' | 'female' | 'other';
  answeredCount: number;
  correctCount: number;
  highestPrize: string;
  status: 'available' | 'answering' | 'completed' | 'absent';
  stars: number;
}

export interface Question {
  id: string;
  level: number; // 1 to 15
  category: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0, 1, 2, 3 (A, B, C, D)
  explanation?: string;
  hint?: string;
}

export type AnswerStatus = 'idle' | 'selected' | 'confirmed' | 'revealed';

export interface LifelineState {
  fiftyFifty: { used: boolean; active: boolean; eliminatedIndices: number[] };
  askAudience: { used: boolean; active: boolean; results?: number[] };
  callAdvisor: { used: boolean; active: boolean; advisorName?: string; advice?: string };
  switchQuestion: { used: boolean; active: boolean };
}

export interface PrizeLevel {
  level: number;
  amount: string;
  rawAmount: number;
  isMilestone: boolean;
}

export const PRIZE_LADDER: PrizeLevel[] = [
  { level: 15, amount: '150.000.000 đ', rawAmount: 150000000, isMilestone: true },
  { level: 14, amount: '85.000.000 đ', rawAmount: 85000000, isMilestone: false },
  { level: 13, amount: '60.000.000 đ', rawAmount: 60000000, isMilestone: false },
  { level: 12, amount: '40.000.000 đ', rawAmount: 40000000, isMilestone: false },
  { level: 11, amount: '30.000.000 đ', rawAmount: 30000000, isMilestone: false },
  { level: 10, amount: '22.000.000 đ', rawAmount: 22000000, isMilestone: true },
  { level: 9, amount: '14.000.000 đ', rawAmount: 14000000, isMilestone: false },
  { level: 8, amount: '10.000.000 đ', rawAmount: 10000000, isMilestone: false },
  { level: 7, amount: '6.000.000 đ', rawAmount: 6000000, isMilestone: false },
  { level: 6, amount: '3.000.000 đ', rawAmount: 3000000, isMilestone: false },
  { level: 5, amount: '2.000.000 đ', rawAmount: 2000000, isMilestone: true },
  { level: 4, amount: '1.000.000 đ', rawAmount: 1000000, isMilestone: false },
  { level: 3, amount: '600.000 đ', rawAmount: 600000, isMilestone: false },
  { level: 2, amount: '400.000 đ', rawAmount: 400000, isMilestone: false },
  { level: 1, amount: '200.000 đ', rawAmount: 200000, isMilestone: false },
];
