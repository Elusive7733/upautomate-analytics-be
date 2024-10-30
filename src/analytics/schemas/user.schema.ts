import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

interface UpworkData {
  title: string;
  description: string;
  skills: string[];
}

// Define interfaces for the populated types
interface Plan {
  plan_name: string;
  feeds_limit: number;
  jobs_per_feed_limit: number;
  jobs_scraping_limit: number;
  jobs_scraping_frequency_hours: number;
  rss_per_feed_limit: number;
  alert_notifications_limit: number;
  alert_notifications_frequency_hours: number;
  job_validation_limit: number;
  job_validation_frequency_hours: number;
  validation_prompt_limit: number;
  notifications_per_feed: number;
  number_of_ai_questions: number;
  stripe_plan_id: string;
  plan_price: number;
  description: string;
  ai_question_allowed: boolean;
}

interface UserLimits {
  plan_id: string;
  jobs_scraping_limit: number;
  jobs_scraping_last_reset: Date;
  alert_notifications_limit: number;
  alert_notifications_last_reset: Date;
  last_notification_exceed_mail: Date;
  job_validation_limit: number;
  job_validation_last_reset: Date;
  alert_notifications: number;
}

@Schema({ collection: 'user' })
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  full_name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'user_limits', required: true })
  limits_id: string | UserLimits;

  @Prop({ required: true, default: false })
  is_verified: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'plan', required: true })
  plan_id: string | Plan;

  @Prop({ default: false })
  is_feed_tutorial_viewed: boolean;

  @Prop({ default: false })
  is_tutorial_viewed: boolean;

  @Prop()
  upwork_profile_url?: string;

  @Prop({ default: false })
  upwork_profile_is_verified: boolean;

  @Prop()
  wizard_id?: string;

  @Prop()
  profile_picture?: string;

  @Prop()
  stripe_customer_id?: string;

  @Prop()
  plan_name?: string;

  @Prop({ default: false })
  is_trial_active: boolean;

  @Prop({ type: Object })
  upwork_data?: UpworkData;

  @Prop()
  date_created: Date;

  @Prop()
  updated_at?: string;

  // New fields for relationships
  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'feed' }])
  feeds?: string[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'rss' }])
  rss?: string[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'validation_prompt' }])
  validation_prompts?: string[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'notification' }])
  notifications?: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index for faster queries
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ upwork_profile_url: 1 });
UserSchema.index({ limits_id: 1 });
UserSchema.index({ date_created: 1 });
UserSchema.index({ plan_id: 1 });