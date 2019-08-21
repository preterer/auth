import { Service } from "typedi";

/**
 * Configuration
 *
 * @export
 * @class AuthConfig
 */
@Service()
export class AuthConfig {
  /**
   * JWT Secret
   *
   * @type {string}
   * @memberof AuthConfig
   */
  jwtSecret: string = process.env.JWT_SECRET || "JWT_SECRET";
}
