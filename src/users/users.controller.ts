import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '../shared/types/api-response.type';
import { User } from '../analytics/schemas/user.schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.usersService.getAllUsers();
  }
} 