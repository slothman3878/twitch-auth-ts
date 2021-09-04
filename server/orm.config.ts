import { MikroORM, Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import path from 'path';

export default {
  migrations: {
    tableName: 'mikro_orm_migrations', // name of database table with log of executed transactions
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations    
    pattern: /^[\w-]+\d+\.ts$/, // regex pattern for the migration files    
    allOrNothing: true, // wrap all migrations in master transaction    
    dropTables: true, // allow to disable table dropping    
    safe: false, // allow to disable table and column dropping     
    emit: 'ts',
  },
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  dbName: process.env.PG_DATABASE,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['server/**/*.entity.ts'],
  type: 'postgresql',
} as Options<PostgreSqlDriver>;