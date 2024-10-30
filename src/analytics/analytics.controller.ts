import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiResponse } from 'src/shared/types/api-response.type';
import { User } from './schemas/user.schema';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get(':days')
  async getAnalytics(
    @Param('days', ParseIntPipe) days: number
  ): Promise<ApiResponse<User[]>> {
    return this.analyticsService.getAnalytics(days);
  }
} 