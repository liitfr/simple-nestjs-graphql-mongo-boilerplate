import { Inject, Type } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { IdScalar } from '../../utils/scalars/id.scalar';
import { getEntityMetadata } from '../../utils/entity-enhancers/entity.util';
import { Id } from '../../utils/id.type';

import { VersioningService } from '../services/versioning.service';

export function resolverFactory(
  EntityVersion: Type<unknown>,
  providerName: string,
) {
  const entityVersionNameValue = getEntityMetadata(EntityVersion)?.entityName;

  if (!entityVersionNameValue) {
    throw new Error(
      'EntityVersion ' + EntityVersion.name + ' : name not found',
    );
  }

  @Resolver(() => EntityVersion)
  class EntityVersionResolver {
    constructor(
      @Inject(providerName)
      readonly versioningService: VersioningService<unknown>,
    ) {}

    @Query(() => [EntityVersion], {
      name: `findAll${entityVersionNameValue}sForOneOriginalId`,
    })
    public async findAllVersionsForOneOriginalId(
      @Args('originalId', { type: () => IdScalar })
      originalId: Id,
    ) {
      return this.versioningService.findAllVersionsForOneOriginalId(originalId);
    }

    @Query(() => EntityVersion, {
      name: `findOne${entityVersionNameValue}ById`,
    })
    public async findOneById(
      @Args('id', { type: () => IdScalar })
      id: Id,
    ) {
      return this.versioningService.findOneById(id);
    }
  }

  return EntityVersionResolver;
}
