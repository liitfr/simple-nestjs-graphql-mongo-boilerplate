import { Injectable, Type } from '@nestjs/common';

import { RelationOptions } from '../relations/relation.util';

import { EntityMetadata, getEntityToken } from './entity.util';

type RelationMetadata = {
  metadata: EntityMetadata;
  options?: RelationOptions;
};

@Injectable()
export class EntityStore {
  private static entities = new Map<symbol, EntityMetadata>();

  public static set(
    entity: symbol | string | Type,
    metadata: Partial<EntityMetadata>,
  ): EntityMetadata {
    let entityToken: symbol | undefined;
    if (typeof entity === 'string') {
      entityToken = [...EntityStore.entities.keys()].find(
        (key) => key.description === entity,
      );
    } else if (typeof entity === 'symbol') {
      entityToken = entity;
    } else {
      const resolvedEntityToken = getEntityToken(entity);
      if (!resolvedEntityToken) {
        throw new Error(`Entity not found`);
      }
      entityToken = resolvedEntityToken;
    }
    if (!entityToken) {
      throw new Error(`Entity not found`);
    }
    const existingMetadata = EntityStore.entities.get(entityToken);
    const newMetadata = {
      ...existingMetadata,
      ...metadata,
    };
    if (!newMetadata.entityToken || !newMetadata.Entity) {
      throw new Error(
        `Entity metadata not complete for ${entity.toString()} : token : ${newMetadata.entityToken?.toString()}`,
      );
    }
    EntityStore.entities.set(entityToken, newMetadata as EntityMetadata);
    return newMetadata as EntityMetadata;
  }

  public static uncertainGet(
    entity: symbol | string | Type,
  ): EntityMetadata | undefined {
    let entityToken: symbol | undefined;
    if (typeof entity === 'string') {
      entityToken = [...EntityStore.entities.keys()].find(
        (key) => key.description === entity,
      );
    } else if (typeof entity === 'symbol') {
      entityToken = entity;
    } else {
      const resolvedEntityToken = getEntityToken(entity);
      if (resolvedEntityToken) {
        entityToken = resolvedEntityToken;
      }
    }
    if (entityToken) {
      return EntityStore.entities.get(entityToken);
    }
    return undefined;
  }

  public static has = (entity: symbol | string | Type): boolean =>
    !!EntityStore.uncertainGet(entity);

  public static get(entity: symbol | string | Type): EntityMetadata {
    const result = EntityStore.uncertainGet(entity);
    if (!result) {
      throw new Error(`Entity not found in EntityStore.`);
    }
    return result;
  }

  public static getRelationMetadata(
    entity: symbol | string,
  ): RelationMetadata[] {
    const entityMetadata = EntityStore.get(entity);
    const relations = entityMetadata?.entityRelations ?? [];
    return relations.map(({ target, details }) => {
      const metadata = EntityStore.get(target);
      return { metadata, details };
    });
  }

  public static getReversedRelationMetadata(target: symbol | string) {
    const targetMetadata = EntityStore.get(target);
    const result: RelationMetadata[] = [];
    for (const [sourceToken, sourceMetadata] of EntityStore.entities) {
      const relations = EntityStore.getRelationMetadata(sourceToken).filter(
        ({ metadata }) => metadata.entityToken === targetMetadata.entityToken,
      );
      if (relations) {
        result.push(
          ...relations.map((relation) => ({
            metadata: sourceMetadata,
            options: relation.options,
          })),
        );
      }
    }
    return result;
  }
}
