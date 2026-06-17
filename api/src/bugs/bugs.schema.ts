import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BugDocument = HydratedDocument<Bug>;

@Schema({ timestamps: true })
export class Bug {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ enum: ['low', 'medium', 'high', 'critical'], default: 'medium' })
  severity: string;

  @Prop({
    enum: ['open', 'in-progress', 'resolved', 'wontfix'],
    default: 'open',
  })
  status: string;

  @Prop({ default: '' })
  project: string;

  @Prop({ default: '' })
  environment: string;

  @Prop({ enum: ['cli', 'web', 'extension'], default: 'web' })
  source: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: '' })
  notes: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const BugSchema = SchemaFactory.createForClass(Bug);

BugSchema.index({ userId: 1, project: 1, status: 1, createdAt: -1 });
BugSchema.index({ userId: 1, severity: 1, status: 1 });
BugSchema.index({ userId: 1, tags: 1 });
