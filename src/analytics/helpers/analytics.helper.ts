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

export function isInteractingUser(user: User): boolean {
  if (!user.updated_at || !user.date_created) {
    return false;
  }
  const updatedAt = new Date(user.updated_at);
  const dateCreated = new Date(user.date_created);
  return !isSameDay(updatedAt, dateCreated);
}

export function isReturningUser(user: User): boolean {
  if (!user.last_login || !user.date_created) {
    return false;
  }
  const lastLogin = new Date(user.last_login);
  const dateCreated = new Date(user.date_created);
  return !isSameDay(lastLogin, dateCreated);
}

export function calculateRetentionMetrics(users: User[]): {
  returningUsers: number;
  interactingUsers: number;
  oneTimeUsers: number;
  returnRate: number;
  interactionRate: number;
} {
  const returningUsers = users.filter(isReturningUser).length;
  const interactingUsers = users.filter(isInteractingUser).length;
  const oneTimeUsers = users.length - interactingUsers;
  const returnRate = users.length > 0 ? (returningUsers / users.length) * 100 : 0;
  const interactionRate = users.length > 0 ? (interactingUsers / users.length) * 100 : 0;

  return {
    returningUsers,
    interactingUsers,
    oneTimeUsers,
    returnRate,
    interactionRate
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
        returningUsers: 0,
        interactingUsers: 0
      });
    }
    
    dailyMap.get(dateKey)!.newUsers++;
  });

  // Process returning users by last login date
  users.forEach(user => {
    if (!isReturningUser(user) || !user.last_login) return;
    
    const lastLogin = new Date(user.last_login);
    const dateKey = lastLogin.toISOString().split('T')[0];
    
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: dateKey,
        newUsers: 0,
        returningUsers: 0,
        interactingUsers: 0
      });
    }
    
    dailyMap.get(dateKey)!.returningUsers++;
  });


  // Process interacting users by updated_at date
  users.forEach(user => {
    if (!isInteractingUser(user) || !user.updated_at) return;
    
    const updatedAt = new Date(user.updated_at);
    const dateKey = updatedAt.toISOString().split('T')[0];
    
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: dateKey,
        newUsers: 0,
        returningUsers: 0,
        interactingUsers: 0
      });
    }
    
    dailyMap.get(dateKey)!.interactingUsers++;
  });

  // Convert to array and sort by date
  return Array.from(dailyMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));
} 