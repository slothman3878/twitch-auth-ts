import express from 'express';
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import {
  Connection,
  IDatabaseDriver,
  MikroORM
} from '@mikro-orm/core';
import { 
  SqlEntityManager,
  EntityManager,
  PostgreSqlDriver,
  AbstractSqlDriver,
  AbstractSqlConnection
} from '@mikro-orm/postgresql';
import ormConfig from './orm.config';
import session from 'express-session';
import connectRedis from 'connect-redis';
import Redis from 'ioredis';
import cors from 'cors';
import passport from 'passport';
import { Strategy } from 'passport-twitch-latest';
import { Server } from 'http';
import path from 'path';

import { HelloResolver } from './resolvers/hello.resolver';

import { DI } from './constants'

require('dotenv').config();
require('./auth');

export default class Application {
  public orm: MikroORM<AbstractSqlDriver<AbstractSqlConnection>>;
  public app: express.Application;
  public apollo: ApolloServer;
  public server: Server;

  //Connect to Database
  public connect = async (): Promise<void> => {
    try {
      this.orm = await MikroORM.init<PostgreSqlDriver>(ormConfig);
    } catch (error) {
      console.error('Could not connect to the database', error);
      throw Error(error);
    }
  };

  //Setup Apollo Server
  public setUpApollo = async (): Promise<void> => {
    try {
      this.apollo = new ApolloServer({
        schema: await buildSchema({
          resolvers: [
            HelloResolver
          ],
          validate: false,
        }),
        context: ({ req, res }) => ({
          req,
          res,
          em: this.orm.em.fork() 
        }),
      });
      await this.apollo.start();
    } catch (error) {
      console.log('Could not set up Apollo Server', error);
      throw Error(error);
    }
  }

  //Initialize Server and apply Middleware
  public init = async (): Promise<void> => {
    this.app = express();
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })); 

    /// Session Store
    const RedisStore = connectRedis(session);
    let redis: Redis.Redis;
    redis = new Redis(
      process.env.NODE_ENV ? process.env.REDIS_URL : undefined
    );
    this.app.use(
      session({
        store: new RedisStore({
          client: redis,
          disableTouch: true,
        }),
        cookie: {
          maxAge: 1000 * 60 * 60 * 24, // 1 year
          httpOnly: true,
        },
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET ?? "secret",
        resave: false,
      })
    );

    this.app.use(passport.initialize());
    this.app.use(passport.session());

    this.apollo.applyMiddleware({
      app: this.app,
      cors: false,
    });

    DI.em = this.orm.em.fork();

    try {
      const port = process.env.PORT || 5000;

      this.app.get("/", (req, res) => {
        if(req.user) res.send(req.user);
        else res.send('Hello World!');
      });

      this.app.get("/auth/twitch", passport.authenticate("twitch"));

      this.app.get("/auth/twitch/redirect", 
        passport.authenticate("twitch", { failureRedirect: "/" }), 
        (req, res) => {
          res.redirect('/');
      });

      this.app.listen(port, () => {
        console.log('=================================================')
        console.log(` server started on ${port}`);
        console.log(` api endpoint is "http://localhost:${port}/graphql"`);
        console.log('=================================================');
      });
    } catch (error) {
      console.log('Could not initialize server', error);
      throw Error(error);
    }
  };
}