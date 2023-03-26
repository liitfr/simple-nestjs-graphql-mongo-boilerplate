import { Field, InputType, IntersectionType, OmitType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import { Types as MongooseTypes } from 'mongoose';

import { MongoObjectIdScalar } from '../scalars/mongo-id.scalar';
import { entityDescription } from '../entity-decorator';

export function SimpleEntityInputFactory<T>(classRef: Type<T>) {
  const entityDescriptionValue = classRef[entityDescription];

  @InputType()
  class ClassOptionalId {
    @Field(() => MongoObjectIdScalar, {
      nullable: true,
      description:
        `${entityDescriptionValue}\'s optional id` ??
        'Optional Reference Identifier',
    })
    readonly _id?: MongooseTypes.ObjectId;
  }

  const omitedFields = [
    '_id',
    'createdAt',
    'updatedAt',
    'createdBy',
    'updatedBy',
  ];

  return IntersectionType(
    OmitType(classRef, omitedFields as (keyof T)[], InputType),
    ClassOptionalId,
  );
}