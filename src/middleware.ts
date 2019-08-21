import passport from "passport";
import { Request, Response, NextFunction } from "express";

/**
 * Authentication middleware
 *
 * @export
 * @returns
 */
export function authMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (user) {
        req.user = user;
      }
      next();
    })(req, res, next);
  };
}
