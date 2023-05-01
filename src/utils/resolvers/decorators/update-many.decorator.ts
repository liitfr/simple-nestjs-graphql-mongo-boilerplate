import {
  SetMetadata,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { IS_PUBLIC_KEY } from '../../../authentication/decorators/public.decorator';
import { CurrentUserId } from '../../../users/decorators/current-user-id.decorator';
import { SimplePoliciesGuard } from '../../../authorization/guards/simple-policies.guard';
import { CheckPolicies } from '../../../authorization/decorators/check-policies.decorator';
import { CheckRelations } from '../../../data/pipes/check-relations.pipe';
import { UserActionEnum } from '../../../references/enums/user-action.enum';

import { Constructor } from '../../types/constructor.type';
import { pascalCase, pluralize } from '../../string.util';
import { Id } from '../../types/id.type';
import { Pipe } from '../../types/pipe.type';

import {
  MutationOptions,
  defaultMutationOptions,
} from '../options/mutation-options';
import { SimpleResolver } from '../types/simple-resolver.type';
import { SimpleResolverDecoratorParams } from '../types/simple-resolver-decorator-params.type';
import { ResolverOptions } from '../types/options.type';
import { SimpleFilter } from '../types/simple-filter.type';
import { ResolverOperationEnum } from '../enums/resolver-operation.enum';

import { SetResolverOperation } from './set-resolver-operation.decorator';
import { SetUserAction } from './set-user-action.decorator';

export type UpdateManyOptions<E extends object> = MutationOptions & {
  Filter: SimpleFilter<E>;
  filterPipes?: Pipe[];
  Payload: SimpleFilter<E>;
  payloadPipes?: Pipe[];
};

export function WithUpdateMany<E extends object>({
  Entity,
  options: pOptions,
  PartialInput,
  entityDescription,
  entityTokenDescription,
  isTrackable,
}: SimpleResolverDecoratorParams<E>) {
  const options: ResolverOptions<E> = {
    ...pOptions,
    updateMany: {
      ...defaultMutationOptions,
      enable: false,
      Filter: PartialInput,
      Payload: PartialInput,
      ...pOptions.updateMany,
    },
  };

  const checkPolicies =
    options.updateMany &&
    options.updateMany?.checkPolicies !== null &&
    typeof options.updateMany?.checkPolicies !== 'undefined'
      ? options.updateMany?.checkPolicies
      : options.general?.defaultMutationCheckPolicies !== null &&
        typeof options.general?.defaultMutationCheckPolicies !== 'undefined'
      ? options.general?.defaultMutationCheckPolicies
      : true;

  let checkRelations = true;
  if (
    options.updateMany &&
    options.updateMany?.checkRelations !== null &&
    typeof options.updateMany?.checkRelations !== 'undefined'
  ) {
    checkRelations = options.updateMany.checkRelations;
  } else if (
    options.general &&
    options.general?.defaultMutationCheckRelations !== null &&
    typeof options.general?.defaultMutationCheckRelations !== 'undefined'
  ) {
    checkRelations = options.general.defaultMutationCheckRelations;
  }

  return <T extends Constructor<SimpleResolver<E>>>(constructor: T) => {
    if (
      !options.general?.enableMutations ||
      options.updateMany === false ||
      !options.updateMany?.enable
    ) {
      return constructor;
    }

    const Filter = options.updateMany.Filter;
    const Payload = options.updateMany.Payload;

    class ResolverWithUpdateMany extends constructor {
      @UseGuards(
        ...(options.updateMany && options.updateMany?.guards?.length
          ? options.updateMany.guards
          : options.general?.defaultMutationGuards ?? []),
        ...(checkPolicies ? [SimplePoliciesGuard] : []),
      )
      @UseInterceptors(
        ...(options.updateMany && options.updateMany?.interceptors?.length
          ? options.updateMany.interceptors
          : options.general?.defaultMutationInterceptors ?? []),
      )
      @UseFilters(
        ...(options.updateMany && options.updateMany?.filters?.length
          ? options.updateMany.filters
          : options.general?.defaultMutationFilters ?? []),
      )
      @CheckPolicies(
        ...(!checkPolicies
          ? [() => true]
          : options.updateMany && options.updateMany?.policyHandlers
          ? options.updateMany.policyHandlers
          : [options.general?.updatePolicyHandler ?? (() => false)]),
      )
      @SetResolverOperation(ResolverOperationEnum.UpdateMany)
      @SetUserAction(UserActionEnum.Update)
      @SetMetadata(
        IS_PUBLIC_KEY,
        (options.updateMany && options.updateMany?.public) ??
          options.general?.defaultMutationPublic ??
          false,
      )
      @Mutation(() => Entity, {
        nullable: false,
        description: `${entityDescription} : Update many mutation`,
        name: `updateMany${pluralize(
          pascalCase(entityTokenDescription ?? 'unknown'),
        )}`,
      })
      async updateMany(
        @CurrentUserId() userId: Id,
        @Args(
          'filter',
          { type: () => Filter },
          ...(options.updateMany && options.updateMany?.filterPipes
            ? options.updateMany.filterPipes
            : options.general?.defaultMutationPipes ?? []),
        )
        filter: InstanceType<typeof Filter>,
        @Args(
          'update',
          { type: () => Payload },
          ...(checkRelations ? [new CheckRelations(Entity)] : []),
          ...(options.updateMany && options.updateMany?.payloadPipes
            ? options.updateMany.payloadPipes
            : options.general?.defaultMutationPipes ?? []),
        )
        update: InstanceType<typeof Payload>,
      ) {
        return this.simpleService.updateMany(filter, {
          ...update,
          ...(isTrackable ? { updatedBy: userId, updatedAt: new Date() } : {}),
        });
      }
    }

    return ResolverWithUpdateMany;
  };
}
