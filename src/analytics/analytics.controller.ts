import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { User } from './schemas/user.schema';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics(): Promise<User[]> {
    return this.analyticsService.getAnalytics();
  }
} 