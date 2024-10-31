import { Injectable, Logger } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { ApiResponse } from '../shared/types/api-response.type';
import { UserAnalytics } from './types/user-analytics.type';
import { UsersService } from '../users/users.service';
import { 
  calculatePlanAnalytics, 
  filterUsersByDateRange, 
  createMetricComparison,
  calculateAverage,
  calculateRetentionMetrics 
} from './helpers/analytics.helper';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly usersService: UsersService
  ) {}

  async getAnalytics(days?: number): Promise<ApiResponse<UserAnalytics>> {
    this.logger.log(`Starting analytics calculation${days ? ` for ${days} days` : ' for all time'}`);
    
    try {
      this.logger.debug('Fetching users from UsersService');
      const usersResponse = await this.usersService.getAllUsers();
      
      if (!usersResponse.data || usersResponse.statusCode !== 200) {
        this.logger.warn('Failed to fetch users:', usersResponse);
        return {
          statusCode: usersResponse.statusCode,
          message: usersResponse.message,
          data: null,
          error: usersResponse.error
        };
      }

      this.logger.debug(`Retrieved ${usersResponse.data.length} users`);

      const allUsers = usersResponse.data;
      const currentEnd = new Date();
      currentEnd.setHours(23, 59, 59, 999);
      const currentStart = new Date();
      
      let previousStart: Date;
      let previousEnd: Date;
      
      if (days) {
        currentStart.setDate(currentStart.getDate() - (days - 1));
        currentStart.setHours(0, 0, 0, 0);
        
        previousEnd = new Date(currentStart);
        previousEnd.setDate(previousEnd.getDate() - 1);
        previousEnd.setHours(23, 59, 59, 999);
        
        previousStart = new Date(previousEnd);
        previousStart.setDate(previousStart.getDate() - (days - 1));
        previousStart.setHours(0, 0, 0, 0);
      } else {
        currentStart.setFullYear(2020, 0, 1);
        currentStart.setHours(0, 0, 0, 0);
        
        previousStart = new Date(currentStart);
        previousEnd = new Date(currentStart);
      }

      const currentUsers = filterUsersByDateRange(allUsers, currentStart, currentEnd);
      const previousUsers = days ? 
        filterUsersByDateRange(allUsers, previousStart, previousEnd) : 
        [];

      if (currentUsers.length === 0) {
        return {
          statusCode: 404,
          message: `No users found ${days ? `in the last ${days} days` : 'for all time'}`,
          data: null
        };
      }

      const currentRetention = calculateRetentionMetrics(currentUsers);
      const previousRetention = calculateRetentionMetrics(previousUsers);

      const analytics: UserAnalytics = {
        timeRange: {
          current: { start: currentStart, end: currentEnd },
          previous: { start: previousStart, end: previousEnd }
        },
        userMetrics: {
          totalUsers: createMetricComparison(
            currentUsers.length,
            previousUsers.length
          ),
          activeTrials: createMetricComparison(
            currentUsers.filter(u => u.is_trial_active).length,
            previousUsers.filter(u => u.is_trial_active).length
          ),
          verifiedUsers: createMetricComparison(
            currentUsers.filter(u => u.is_verified).length,
            previousUsers.filter(u => u.is_verified).length
          ),
          unverifiedUsers: createMetricComparison(
            currentUsers.filter(u => !u.is_verified).length,
            previousUsers.filter(u => !u.is_verified).length
          )
        },
        planDistribution: {
          current: Array.from(calculatePlanAnalytics(currentUsers).values()),
          previous: Array.from(calculatePlanAnalytics(previousUsers).values())
        },
        userEngagement: {
          usersWithFeeds: createMetricComparison(
            currentUsers.filter(u => (u.feeds?.length || 0) > 0).length,
            previousUsers.filter(u => (u.feeds?.length || 0) > 0).length
          ),
          usersWithoutFeeds: createMetricComparison(
            currentUsers.filter(u => !u.feeds?.length).length,
            previousUsers.filter(u => !u.feeds?.length).length
          ),
          averageFeedsPerUser: createMetricComparison(
            calculateAverage(currentUsers, u => u.feeds?.length || 0),
            calculateAverage(previousUsers, u => u.feeds?.length || 0)
          ),
          totalFeeds: createMetricComparison(
            currentUsers.reduce((acc, u) => acc + (u.feeds?.length || 0), 0),
            previousUsers.reduce((acc, u) => acc + (u.feeds?.length || 0), 0)
          ),
          usersWithRss: createMetricComparison(
            currentUsers.filter(u => (u.rss?.length || 0) > 0).length,
            previousUsers.filter(u => (u.rss?.length || 0) > 0).length
          ),
          totalRssFeeds: createMetricComparison(
            currentUsers.reduce((acc, u) => acc + (u.rss?.length || 0), 0),
            previousUsers.reduce((acc, u) => acc + (u.rss?.length || 0), 0)
          ),
          averageRssPerUser: createMetricComparison(
            calculateAverage(currentUsers, u => u.rss?.length || 0),
            calculateAverage(previousUsers, u => u.rss?.length || 0)
          )
        },
        upworkIntegration: {
          verifiedProfiles: createMetricComparison(
            currentUsers.filter(u => u.upwork_profile_is_verified).length,
            previousUsers.filter(u => u.upwork_profile_is_verified).length
          ),
          unverifiedProfiles: createMetricComparison(
            currentUsers.filter(u => !u.upwork_profile_is_verified).length,
            previousUsers.filter(u => !u.upwork_profile_is_verified).length
          ),
          profilesWithData: createMetricComparison(
            currentUsers.filter(u => u.upwork_data).length,
            previousUsers.filter(u => u.upwork_data).length
          )
        },
        userRetention: {
          returningUsers: createMetricComparison(
            currentRetention.returningUsers,
            previousRetention.returningUsers
          ),
          oneTimeUsers: createMetricComparison(
            currentRetention.oneTimeUsers,
            previousRetention.oneTimeUsers
          ),
          returnRate: createMetricComparison(
            currentRetention.returnRate,
            previousRetention.returnRate
          )
        }
      };

      return {
        statusCode: 200,
        message: `Analytics ${days ? `for users in the last ${days} days` : 'for all time'} generated successfully`,
        data: analytics
      };
    } catch (error) {
      this.logger.error('Error generating analytics:', error);
      return {
        statusCode: 500,
        message: 'Something went wrong',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 