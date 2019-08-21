import passport from "passport";
import { Container } from "typedi";
import { Strategy, ExtractJwt } from "passport-jwt";

import { AuthConfig } from "./config";
import { UserService } from "./services/user.service";

/**
 * Initializes JWT auth strategy
 *
 * @export
 */
export function useAuthStrategy(): void {
  const config = Container.get(AuthConfig);
  const userService = Container.get(UserService);

  const strategy = new Strategy(
    {
      secretOrKey: config.jwtSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    },
    (payload, done) =>
      userService
        .get(payload.id)
        .then(() => done(undefined, payload))
        .catch(() => done(undefined))
  );

  passport.use(strategy).initialize();
}
