import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { ApiResponse } from '../shared/types/api-response.type';
import { UserAnalytics, PlanAnalytics, MetricComparison } from './types/user-analytics.type';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Math.round(((current - previous) / previous) * 100);
  }

  private createMetricComparison(current: number, previous: number): MetricComparison {
    return {
      current,
      previous,
      percentageChange: this.calculatePercentageChange(current, previous)
    };
  }

  private calculatePlanAnalytics(users: any[]): Map<string, PlanAnalytics> {
    const planMap = new Map<string, PlanAnalytics>();
    
    users.forEach(user => {
      const plan = user.plan_id as any;
      const planName = plan.plan_name;
      
      if (!planMap.has(planName)) {
        planMap.set(planName, {
          planName,
          userCount: 0,
          averageFeeds: 0,
          trialCount: 0,
          nonTrialCount: 0,
          price: plan.plan_price
        });
      }
      
      const planStats = planMap.get(planName)!;
      planStats.userCount++;
      planStats.averageFeeds += user.feeds?.length || 0;
      user.is_trial_active ? planStats.trialCount++ : planStats.nonTrialCount++;
    });

    planMap.forEach(plan => {
      plan.averageFeeds = Math.round((plan.averageFeeds / plan.userCount) * 100) / 100;
    });

    return planMap;
  }

  async getAnalytics(days: number): Promise<ApiResponse<UserAnalytics>> {
    try {
      const currentEnd = new Date();
      const currentStart = new Date();
      currentStart.setDate(currentStart.getDate() - days);
      
      const previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - days -7);

      // Fetch users for both periods
      const [currentUsers, previousUsers] = await Promise.all([
        this.userModel
          .find({
            date_created: { 
              $gte: currentStart,
              $lte: currentEnd
            }
          })
          .populate({
            path: 'plan_id',
            model: 'plan',
            select: { _id: 0 }
          })
          .populate({
            path: 'limits_id',
            model: 'user_limits',
            select: { _id: 0 }
          })
          .select({ _id: 0 })
          .lean()
          .exec(),
        this.userModel
          .find({
            date_created: { 
              $gte: previousStart,
              $lt: currentStart
            }
          })
          .populate({
            path: 'plan_id',
            model: 'plan',
            select: { _id: 0 }
          })
          .populate({
            path: 'limits_id',
            model: 'user_limits',
            select: { _id: 0 }
          })
          .select({ _id: 0 })
          .lean()
          .exec()
      ]);

      if (!currentUsers || currentUsers.length === 0) {
        return {
          statusCode: 404,
          message: `No users found in the last ${days} days`,
          data: null
        };
      }

      const analytics: UserAnalytics = {
        timeRange: {
          current: { start: currentStart, end: currentEnd },
          previous: { start: previousStart, end: currentStart }
        },
        userMetrics: {
          totalUsers: this.createMetricComparison(
            currentUsers.length,
            previousUsers.length
          ),
          activeTrials: this.createMetricComparison(
            currentUsers.filter(u => u.is_trial_active).length,
            previousUsers.filter(u => u.is_trial_active).length
          ),
          verifiedUsers: this.createMetricComparison(
            currentUsers.filter(u => u.is_verified).length,
            previousUsers.filter(u => u.is_verified).length
          ),
          unverifiedUsers: this.createMetricComparison(
            currentUsers.filter(u => !u.is_verified).length,
            previousUsers.filter(u => !u.is_verified).length
          )
        },
        planDistribution: {
          current: Array.from(this.calculatePlanAnalytics(currentUsers).values()),
          previous: Array.from(this.calculatePlanAnalytics(previousUsers).values())
        },
        userEngagement: {
          usersWithFeeds: this.createMetricComparison(
            currentUsers.filter(u => (u.feeds?.length || 0) > 0).length,
            previousUsers.filter(u => (u.feeds?.length || 0) > 0).length
          ),
          usersWithoutFeeds: this.createMetricComparison(
            currentUsers.filter(u => !u.feeds?.length).length,
            previousUsers.filter(u => !u.feeds?.length).length
          ),
          averageFeedsPerUser: this.createMetricComparison(
            Math.round((currentUsers.reduce((acc, u) => acc + (u.feeds?.length || 0), 0) / currentUsers.length) * 100) / 100,
            Math.round((previousUsers.reduce((acc, u) => acc + (u.feeds?.length || 0), 0) / (previousUsers.length || 1)) * 100) / 100
          ),
          totalFeeds: this.createMetricComparison(
            currentUsers.reduce((acc, u) => acc + (u.feeds?.length || 0), 0),
            previousUsers.reduce((acc, u) => acc + (u.feeds?.length || 0), 0)
          ),
          usersWithRss: this.createMetricComparison(
            currentUsers.filter(u => (u.rss?.length || 0) > 0).length,
            previousUsers.filter(u => (u.rss?.length || 0) > 0).length
          ),
          totalRssFeeds: this.createMetricComparison(
            currentUsers.reduce((acc, u) => acc + (u.rss?.length || 0), 0),
            previousUsers.reduce((acc, u) => acc + (u.rss?.length || 0), 0)
          ),
          averageRssPerUser: this.createMetricComparison(
            Math.round((currentUsers.reduce((acc, u) => acc + (u.rss?.length || 0), 0) / currentUsers.length) * 100) / 100,
            Math.round((previousUsers.reduce((acc, u) => acc + (u.rss?.length || 0), 0) / (previousUsers.length || 1)) * 100) / 100
          )
        },
        upworkIntegration: {
          verifiedProfiles: this.createMetricComparison(
            currentUsers.filter(u => u.upwork_profile_is_verified).length,
            previousUsers.filter(u => u.upwork_profile_is_verified).length
          ),
          unverifiedProfiles: this.createMetricComparison(
            currentUsers.filter(u => !u.upwork_profile_is_verified).length,
            previousUsers.filter(u => !u.upwork_profile_is_verified).length
          ),
          profilesWithData: this.createMetricComparison(
            currentUsers.filter(u => u.upwork_data).length,
            previousUsers.filter(u => u.upwork_data).length
          )
        }
      };

      return {
        statusCode: 200,
        message: `Analytics for users in the last ${days} days generated successfully`,
        data: analytics
      };
    } catch (error) {
      console.error('Error generating analytics:', error);
      return {
        statusCode: 500,
        message: 'Something went wrong',
        error: error.message
      };
    }
  }
} 