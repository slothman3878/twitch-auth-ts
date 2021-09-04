import { EntityManager } from '@mikro-orm/postgresql';
import { Request, Response } from 'express';

export type MyContext = {
  em: EntityManager,
  req: Request,
  res: Response
};