import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types as MongooseTypes } from 'mongoose';

import { Trackable } from '../../utils/entities/trackable.decorator';
import { Memoable } from '../../utils/entities/memoable.decorator';
import { IdScalar } from '../../utils/scalars/id.scalar';
import { Idable } from '../../utils/entities/idable.decorator';
import { Id } from '../../utils/id.type';
import { Type } from '../../references/entities/type.entity';
import { AddReferences } from '../../references/decorators/add-references.decorator';
import { Color } from '../../references/entities/color.entity';

export type PostDocument = HydratedDocument<Post>;

@Idable()
@Memoable()
@Trackable()
@ObjectType()
@Schema()
@AddReferences([
  { Reference: Type, partitionQueries: true },
  { Reference: Color, partitionQueries: true, nullable: true },
])
export class Post {
  @Field({ nullable: false, description: "Post's title" })
  @Prop()
  title: string;

  @Field({ nullable: false, description: "Post's content" })
  @Prop()
  content: string;

  // @Field(() => [Line], { nullable: false })
  // @Prop(() => [LineSchema])
  // lines: Line[];

  @Field(() => IdScalar, {
    nullable: false,
    description: "Post's author id",
  })
  @Prop({
    type: MongooseTypes.ObjectId,
    ref: 'Author',
    autopopulate: false,
    required: true,
  })
  authorId: Id;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Post extends Idable, Trackable, Memoable {}
