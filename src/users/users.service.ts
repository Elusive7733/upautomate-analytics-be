import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../analytics/schemas/user.schema';
import { ApiResponse } from '../shared/types/api-response.type';
import { isDummyEmail } from '../shared/utils/email.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('user') private readonly userModel: Model<User>,
  ) {}

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      const users = await this.userModel
        .find()
        .populate({
          path: 'plan_id',
          model: 'plan'
        })
        .populate({
          path: 'limits_id',
          model: 'user_limits'
        })
        .lean()
        .exec();

      const filteredUsers = users.filter(user => !isDummyEmail(user.email));

      if (!filteredUsers || filteredUsers.length === 0) {
        return {
          statusCode: 404,
          message: 'No users found',
          data: null
        };
      }
      
      return {
        statusCode: 200,
        message: 'Users retrieved successfully',
        data: filteredUsers as User[]
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