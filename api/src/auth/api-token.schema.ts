import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ApiTokenDocument = HydratedDocument<ApiToken>;

@Schema({ timestamps: true, collection: 'api_tokens' })
export class ApiToken {
  @Prop({ required: true })
  userId: string; // NextAuth user ID

  @Prop({ required: true, unique: true })
  tokenHash: string;

  @Prop({ default: 'default' })
  name: string;

  @Prop({ type: Date })
  lastUsedAt: Date;
}

export const ApiTokenSchema = SchemaFactory.createForClass(ApiToken);
ApiTokenSchema.index({ userId: 1, name: 1 });
