import { Type } from '@nestjs/common';
import { Field, InputType } from '@nestjs/graphql';

import {
  SimpleEntityInputFactory,
  SimpleEntityInputFactoryOptions,
} from '../../utils/dtos/simple-entity-input.factory';
import { EntityStore } from '../../utils/entities/entity-store.service';

import { ChipInput } from '../dtos/chip.input';
import { ReferenceStore } from '../services/reference-store.service';

// BUG : fix typing that is brut force casted to Partial<R>
export function SimpleReferenceInputFactory<
  R extends object & { chip?: string },
>(
  Reference: Type<R>,
  options?: SimpleEntityInputFactoryOptions<R>,
): Type<Partial<R>> {
  const { addChip } = ReferenceStore.get(Reference);
  const { entityDescription } = EntityStore.get(Reference);

  if (addChip) {
    @InputType({ isAbstract: true })
    class MandatoryChipField {
      @Field(() => ChipInput, {
        description: `${entityDescription}'s chip`,
        nullable: false,
      })
      readonly chip: ChipInput;
    }

    return SimpleEntityInputFactory(Reference, {
      ...(options ?? {}),
      removeFields: [...(options?.removeFields ?? []), 'chip'],
      addFields: [...(options?.addFields ?? []), MandatoryChipField],
    });
  }

  return SimpleEntityInputFactory(Reference, options);
}
