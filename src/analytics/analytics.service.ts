import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { ApiResponse } from 'src/shared/types/api-response.type';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getAnalytics(days: number): Promise<ApiResponse<User[]>> {
    try {
      const dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - days);

      const users = await this.userModel
        .find({
          date_created: { 
            $gte: dateFilter 
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
        .exec();

      if (!users || users.length === 0) {
        return {
          statusCode: 404,
          message: `No users found in the last ${days} days`,
          data: null
        };
      }

      return {
        statusCode: 200,
        message: `Users created in the last ${days} days fetched successfully`,
        data: users as User[]
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        statusCode: 500,
        message: 'Something went wrong',
        error: error.message
      };
    }
  }
} 