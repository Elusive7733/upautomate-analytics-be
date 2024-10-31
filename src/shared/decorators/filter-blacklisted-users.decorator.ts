import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { BLACKLISTED_EMAILS } from '../constants/blacklisted-emails.constant';

export const FilterBlacklistedUsers = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse();
    
    // Add a transform function to the response object
    response.filterBlacklistedUsers = (users: any[]) => {
      return users.filter(user => !BLACKLISTED_EMAILS.includes(user.email));
    };
    
    return response.filterBlacklistedUsers;
  },
); 