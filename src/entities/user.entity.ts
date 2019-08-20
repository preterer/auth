import { Entity, Column } from "typeorm";

import { Tables } from "../enums/tables";
import { CoreEntity } from "./core.entity";

/**
 * User entity
 *
 * @export
 * @class User
 * @extends {CoreEntity}
 */
@Entity({ name: Tables.USER })
export class User extends CoreEntity {
  /**
   * User login
   *
   * @type {string}
   * @memberof User
   */
  @Column({ name: "login", nullable: false })
  login: string;

  /**
   * User password hash
   *
   * @type {string}
   * @memberof User
   */
  @Column({ name: "password", nullable: false })
  password: string;
}
