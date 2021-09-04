import passport from 'passport';
import { User } from '../entities/user.entity';
import { DI } from '../constants';
require('./twitch.auth');

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: any, done) => {
  const repo = DI.em.getRepository(User);
  try {
    const user = await repo.findOneOrFail(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});