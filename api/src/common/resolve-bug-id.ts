import { Types } from 'mongoose';

const HEX_PREFIX = /^[0-9a-f]{6,23}$/i;

export interface BugIdFilter {
  _id: Types.ObjectId | { $gte: Types.ObjectId; $lte: Types.ObjectId };
}

export function resolveBugId(input: string): BugIdFilter | null {
  if (Types.ObjectId.isValid(input)) {
    return { _id: new Types.ObjectId(input) };
  }

  if (HEX_PREFIX.test(input)) {
    const prefix = input.toLowerCase();
    return {
      _id: {
        $gte: new Types.ObjectId(prefix.padEnd(24, '0')),
        $lte: new Types.ObjectId(prefix.padEnd(24, 'f')),
      },
    };
  }

  return null;
}
