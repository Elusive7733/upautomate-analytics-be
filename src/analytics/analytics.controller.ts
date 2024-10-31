import { Controller, Get, Param, ParseIntPipe, Logger } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiResponse } from '../shared/types/api-response.type';
import { DailyUserDistribution, UserAnalytics } from './types/user-analytics.type';

@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);
  
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('health')
  async healthCheck() {
    this.logger.log('Health check called');
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get()
  async getAllTimeAnalytics(): Promise<ApiResponse<UserAnalytics>> {
    this.logger.log('Getting all-time analytics');
    try {
      const result = await this.analyticsService.getAnalytics();
      this.logger.log('Analytics retrieved successfully');
      return result;
    } catch (error) {
      this.logger.error('Error getting all-time analytics:', error);
      throw error;
    }
  }
  
  @Get("daily-distribution")
  async getDailyDistribution(): Promise<ApiResponse<DailyUserDistribution[]>> {
    this.logger.log('Getting daily distribution');
    try {
      const result = await this.analyticsService.getDailyDistribution();
      this.logger.log('Daily distribution retrieved successfully');
      return result;
    } catch (error) {
      this.logger.error('Error getting daily distribution:', error);
      throw error;
    }
  }
  
  @Get(':days')
  async getAnalytics(
    @Param('days', ParseIntPipe) days: number
  ): Promise<ApiResponse<UserAnalytics>> {
    this.logger.log(`Getting analytics for last ${days} days`);
    try {
      const result = await this.analyticsService.getAnalytics(days);
      this.logger.log('Analytics retrieved successfully');
      return result;
    } catch (error) {
      this.logger.error(`Error getting analytics for ${days} days:`, error);
      throw error;
    }
  }

} 