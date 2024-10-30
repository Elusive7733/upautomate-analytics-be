import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiResponse } from 'src/shared/types/api-response.type';
import { User } from './schemas/user.schema';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics(): Promise<ApiResponse<User[]>> {
    return this.analyticsService.getAnalytics();
  }
} 