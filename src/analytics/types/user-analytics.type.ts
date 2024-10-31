export interface PlanAnalytics {
  planName: string;
  userCount: number;
  averageFeeds: number;
  trialCount: number;
  nonTrialCount: number;
  price: number;
}

export interface MetricComparison {
  current: number;
  previous: number;
  percentageChange: number;
}

export interface UserAnalytics {
  timeRange: {
    current: { start: Date; end: Date };
    previous: { start: Date; end: Date };
  };
  userMetrics: {
    totalUsers: MetricComparison;
    activeTrials: MetricComparison;
    verifiedUsers: MetricComparison;
    unverifiedUsers: MetricComparison;
  };
  planDistribution: {
    current: PlanAnalytics[];
    previous: PlanAnalytics[];
  };
  userEngagement: {
    usersWithFeeds: MetricComparison;
    usersWithoutFeeds: MetricComparison;
    averageFeedsPerUser: MetricComparison;
    totalFeeds: MetricComparison;
    usersWithRss: MetricComparison;
    totalRssFeeds: MetricComparison;
    averageRssPerUser: MetricComparison;
  };
  upworkIntegration: {
    verifiedProfiles: MetricComparison;
    unverifiedProfiles: MetricComparison;
    profilesWithData: MetricComparison;
  };
  userRetention: {
    returningUsers: MetricComparison;
    oneTimeUsers: MetricComparison;
    returnRate: MetricComparison;
  };
} 