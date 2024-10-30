import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'plan' })
export class Plan extends Document {
  @Prop()
  plan_name: string;

  @Prop()
  feeds_limit: number;

  @Prop()
  jobs_per_feed_limit: number;

  @Prop()
  jobs_scraping_limit: number;

  @Prop()
  jobs_scraping_frequency_hours: number;

  @Prop()
  rss_per_feed_limit: number;

  @Prop()
  alert_notifications_limit: number;

  @Prop()
  alert_notifications_frequency_hours: number;

  @Prop()
  job_validation_limit: number;

  @Prop()
  job_validation_frequency_hours: number;

  @Prop()
  validation_prompt_limit: number;

  @Prop()
  notifications_per_feed: number;

  @Prop()
  number_of_ai_questions: number;

  @Prop()
  stripe_plan_id: string;

  @Prop()
  plan_price: number;

  @Prop()
  description: string;

  @Prop()
  ai_question_allowed: boolean;
}

export const PlanSchema = SchemaFactory.createForClass(Plan); 