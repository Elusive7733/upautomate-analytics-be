import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'user_limits' })
export class UserLimits extends Document {
  @Prop()
  plan_id: string;

  @Prop()
  jobs_scraping_limit: number;

  @Prop()
  jobs_scraping_last_reset: Date;

  @Prop()
  alert_notifications_limit: number;

  @Prop()
  alert_notifications_last_reset: Date;

  @Prop()
  last_notification_exceed_mail: Date;

  @Prop()
  job_validation_limit: number;

  @Prop()
  job_validation_last_reset: Date;

  @Prop()
  alert_notifications: number;
}

export const UserLimitsSchema = SchemaFactory.createForClass(UserLimits); 