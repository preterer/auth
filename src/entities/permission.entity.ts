import { Entity } from "typeorm";

import { CoreEntity } from "./core.entity";
import { Tables } from "../enums/tables";

/**
 * Permission entity
 *
 * @export
 * @class Permission
 * @extends {CoreEntity}
 */
@Entity({ name: Tables.PERMISSION })
export class Permission extends CoreEntity {
  /**
   * Permission name
   *
   * @type {string}
   * @memberof Permission
   */
  name: string;
}
