import passport from 'passport';
import { Strategy } from 'passport-twitch-latest';
import { Request } from 'express';
import { User } from '../entities/user.entity';
import { DI } from '../constants';

passport.use(new Strategy({
    clientID: process.env.TWITCH_CLIENT_ID!,
    clientSecret: process.env.TWITCH_CLIENT_SECRET!,
    callbackURL: process.env.TWITCH_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    const repo = DI.em.getRepository(User);
    try {
      const user = await repo.findOneOrFail({ twitch_id: profile.id });
      done(null, user);
    } catch (err) {
      const user = new User({ twitch_id: profile.id });
      await DI.em.persist(user).flush();
      done(null, user);
    }
  }
));