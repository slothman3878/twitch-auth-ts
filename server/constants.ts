import { EntityManager } from '@mikro-orm/postgresql';

export const DI = {} as {
  em: EntityManager
}