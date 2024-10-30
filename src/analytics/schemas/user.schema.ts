import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'user' })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  password?: string;

  @Prop()
  feeds?: any[];

  @Prop()
  rss?: any[];

  @Prop()
  upwork_accounts?: any[];

  @Prop()
  validation_prompts?: any[];

  @Prop()
  notifications?: any[];

  @Prop({ type: Date })
  date_created?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User); 