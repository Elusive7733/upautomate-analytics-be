import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiResponse } from '../shared/types/api-response.type';
import { UserAnalytics } from './types/user-analytics.type';


@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get(':days')
  async getAnalytics(
    @Param('days', ParseIntPipe) days: number
  ): Promise<ApiResponse<UserAnalytics>> {
    return this.analyticsService.getAnalytics(days);
  }
} 