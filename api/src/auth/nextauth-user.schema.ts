import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NextAuthUserDocument = HydratedDocument<NextAuthUser>;

@Schema({ collection: 'users' })
export class NextAuthUser {
  @Prop()
  email: string;
}

export const NextAuthUserSchema = SchemaFactory.createForClass(NextAuthUser);
