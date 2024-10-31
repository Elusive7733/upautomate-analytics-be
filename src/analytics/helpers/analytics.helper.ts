import { User } from '../schemas/user.schema';
import { MetricComparison, PlanAnalytics, DailyUserDistribution } from '../types/user-analytics.type';

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

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

export function isReturningUser(user: User): boolean {
  if (!user.updated_at || !user.date_created) {
    return false;
  }
  const updatedAt = new Date(user.updated_at);
  const dateCreated = new Date(user.date_created);
  return !isSameDay(updatedAt, dateCreated);
}

export function calculateRetentionMetrics(users: User[]): {
  returningUsers: number;
  oneTimeUsers: number;
  returnRate: number;
} {
  const returningUsers = users.filter(isReturningUser).length;
  const oneTimeUsers = users.length - returningUsers;
  const returnRate = users.length > 0 ? (returningUsers / users.length) * 100 : 0;

  return {
    returningUsers,
    oneTimeUsers,
    returnRate
  };
}

export function calculateDailyDistribution(users: User[]): DailyUserDistribution[] {
  const dailyMap = new Map<string, DailyUserDistribution>();
  
  // Process new users by creation date
  users.forEach(user => {
    const dateCreated = new Date(user.date_created);
    const dateKey = dateCreated.toISOString().split('T')[0];
    
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: dateKey,
        newUsers: 0,
        returningUsers: 0
      });
    }
    
    dailyMap.get(dateKey)!.newUsers++;
  });

  // Process returning users by update date
  users.forEach(user => {
    if (!isReturningUser(user) || !user.updated_at) return;
    
    const updateDate = new Date(user.updated_at);
    const dateKey = updateDate.toISOString().split('T')[0];
    
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: dateKey,
        newUsers: 0,
        returningUsers: 0
      });
    }
    
    dailyMap.get(dateKey)!.returningUsers++;
  });

  // Convert to array and sort by date
  return Array.from(dailyMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));
} 