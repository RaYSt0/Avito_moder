export interface Moderator {
  id: number;
  name: string;
  email: string;
  role: string;
  statistics: {
    totalReviewed: number;
    todayReviewed: number;
    thisWeekReviewed: number;
    thisMonthReviewed: number;
    averageReviewTime: number;
    approvalRate: number;
  };
  permissions: string[];
}

