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

  async getAnalytics(): Promise<ApiResponse<User[]>> {
    try {
      const users = await this.userModel.collection
        .find(
          {},
          {
            projection: {
              _id: 0,
              date_created: 0,
              password: 0,
              feeds: 0,
              rss: 0,
              upwork_accounts: 0,
              validation_prompts: 0,
              notifications: 0,
            },
          }
        )
        .toArray();

      if (!users || users.length === 0) {
        return {
          statusCode: 404,
          message: 'Users not found',
          data: null
        };
      }

      return {
        statusCode: 200,
        message: 'Users detail fetched successfully',
        data: users as User[]
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Something went wrong',
        error: error.message
      };
    }
  }
} 