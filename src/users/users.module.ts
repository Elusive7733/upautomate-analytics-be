import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from '../analytics/schemas/user.schema';
import { Plan, PlanSchema } from '../analytics/schemas/plan.schema';
import { UserLimits, UserLimitsSchema } from '../analytics/schemas/user-limits.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'user', schema: UserSchema },
      { name: 'plan', schema: PlanSchema },
      { name: 'user_limits', schema: UserLimitsSchema }
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {} 