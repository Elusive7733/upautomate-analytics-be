import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { User, UserSchema } from './schemas/user.schema';
import { Plan, PlanSchema } from './schemas/plan.schema';
import { UserLimits, UserLimitsSchema } from './schemas/user-limits.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { 
        name: User.name, 
        schema: UserSchema 
      },
      { 
        name: 'plan', 
        schema: PlanSchema,
        collection: 'plan'
      },
      { 
        name: 'user_limits', 
        schema: UserLimitsSchema,
        collection: 'user_limits'
      }
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {} 