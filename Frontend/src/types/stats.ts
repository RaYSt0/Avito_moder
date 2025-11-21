export type StatsPeriod = 'today' | 'week' | 'month';

export interface SummaryStats {
  totalReviewed: number;
  totalReviewedToday: number;
  totalReviewedThisWeek: number;
  totalReviewedThisMonth: number;
  approvedPercentage: number;
  rejectedPercentage: number;
  requestChangesPercentage: number;
  averageReviewTime: number;
}

export interface ActivityPoint {
  date: string;
  approved: number;
  rejected: number;
  requestChanges: number;
}

export interface DecisionsChart {
  approved: number;
  rejected: number;
  requestChanges: number;
}

export type CategoriesChart = Record<string, number>;

