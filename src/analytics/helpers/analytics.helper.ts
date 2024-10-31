import { User } from '../schemas/user.schema';
import { MetricComparison, PlanAnalytics } from '../types/user-analytics.type';

interface Plan {
  plan_name: string;
  plan_price: number;
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

export function createMetricComparison(current: number, previous: number): MetricComparison {
  return {
    current,
    previous,
    percentageChange: calculatePercentageChange(current, previous)
  };
}

export function calculatePlanAnalytics(users: User[]): Map<string, PlanAnalytics> {
  const planMap = new Map<string, PlanAnalytics>();
  
  users.forEach(user => {
    const plan = user.plan_id as Plan;
    if (!plan?.plan_name) return;
    
    if (!planMap.has(plan.plan_name)) {
      planMap.set(plan.plan_name, {
        planName: plan.plan_name,
        userCount: 0,
        averageFeeds: 0,
        trialCount: 0,
        nonTrialCount: 0,
        price: plan.plan_price
      });
    }
    
    const planStats = planMap.get(plan.plan_name)!;
    planStats.userCount++;
    planStats.averageFeeds += user.feeds?.length || 0;
    if (user.is_trial_active) {
      planStats.trialCount++;
    } else {
      planStats.nonTrialCount++;
    }
  });

  planMap.forEach(plan => {
    if (plan.userCount > 0) {
      plan.averageFeeds = Math.round((plan.averageFeeds / plan.userCount) * 100) / 100;
    }
  });

  return planMap;
}

export function filterUsersByDateRange(users: User[], startDate: Date, endDate: Date): User[] {
  return users.filter(user => {
    const userDate = new Date(user.date_created);
    return userDate >= startDate && userDate <= endDate;
  });
}

export function calculateAverage(users: User[], valueGetter: (user: User) => number): number {
  if (users.length === 0) return 0;
  const sum = users.reduce((acc, user) => acc + valueGetter(user), 0);
  return Math.round((sum / users.length) * 100) / 100;
} 