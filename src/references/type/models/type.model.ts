import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { entityDescription } from '../../../utils/entity-enhancers/enhancers.util';
import { Idable } from '../../../utils/entity-enhancers/idable.decorator';

export type TypeDocument = HydratedDocument<Type>;

@Idable()
@ObjectType()
@Schema()
export class Type {
  static [entityDescription] = 'Type';

  @Field({ nullable: false })
  @Prop()
  label: string;
}

export const TypeSchema = SchemaFactory.createForClass(Type);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Type extends Idable {}