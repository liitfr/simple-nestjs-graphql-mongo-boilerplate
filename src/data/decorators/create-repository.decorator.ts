import {
  RepositoryStore,
  RepositoryStoreRegisterOptions,
} from '../services/repository-store.service';

export function CreateRepository(options?: RepositoryStoreRegisterOptions) {
  return <T extends { new (...args: any[]): object }>(constructor: T) => {
    RepositoryStore.register(constructor, options);

    return constructor;
  };
}
