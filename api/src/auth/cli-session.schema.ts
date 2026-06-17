import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CliSessionDocument = HydratedDocument<CliSession>;

@Schema({ timestamps: true, collection: 'cli_sessions' })
export class CliSession {
  @Prop({ required: true, unique: true })
  codeHash: string;

  @Prop({ enum: ['pending', 'approved'], default: 'pending' })
  status: string;

  @Prop()
  userId: string;

  @Prop()
  apiToken: string; // raw token stored briefly until CLI polls

  @Prop({ required: true })
  expiresAt: Date;
}

export const CliSessionSchema = SchemaFactory.createForClass(CliSession);
// TTL index — MongoDB auto-deletes expired sessions
CliSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
