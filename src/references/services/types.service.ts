import { TypesRepository } from '../repositories/abstract/types.repository';
import { Type } from '../entities/type.entity';
import { SimpleReferenceServiceFactory } from '../factories/simple-reference-service.factory';

export class TypesService extends SimpleReferenceServiceFactory(
  Type,
  TypesRepository,
) {}
