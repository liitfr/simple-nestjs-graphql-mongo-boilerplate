import { Types as MongooseTypes } from 'mongoose';
import { L, A, Object } from 'ts-toolbelt';
import { update, cloneDeep } from 'lodash';

import { Id } from '../types/id.type';

import { resolveWildcardPathsInObject } from './resolve-wildcard-paths-in-object.util';

type RecurseUpdate<
  O extends object,
  P extends ReadonlyArray<ReadonlyArray<A.Key>>,
> = L.Length<P> extends 0
  ? O
  : RecurseUpdate<Object.P.Update<O, L.Head<P>, Id>, L.Tail<P>>;

export const convertObjectIds = <
  T extends object,
  P extends ReadonlyArray<ReadonlyArray<A.Key>> = [['_id']],
>(
  obj: T,
  wildcardPaths: string[] = ['_id'],
): RecurseUpdate<T, P> => {
  const newObj = cloneDeep(obj);
  const convertedPaths = resolveWildcardPathsInObject(newObj, wildcardPaths);

  for (const convertedPath of convertedPaths) {
    update(newObj, convertedPath, (value) => {
      if (
        value &&
        typeof value === 'string' &&
        value.length === 24 &&
        value.match(/^[0-9a-fA-F]{24}$/)
      ) {
        return new MongooseTypes.ObjectId(value);
      }

      throw new Error(
        `Invalid ObjectId. Object : ${JSON.stringify(
          obj,
        )}, path: ${convertedPath}`,
      );
    });
  }

  return newObj as RecurseUpdate<T, P>;
};

export const convertObjectId = <T extends object>(
  obj: T,
): RecurseUpdate<T, [['_id']]> => convertObjectIds(obj);
