import session from 'express-session';

declare module 'express-session' {
  export interface SessionData {
    twitch: {
      id: string,
      access_token: string,
      refresh_token: string,
    };
  }
}