import { CoreEntity } from "./core.entity";
import { Column } from "typeorm";

/**
 * Role entity
 *
 * @export
 * @class Role
 * @extends {CoreEntity}
 */
export class Role extends CoreEntity {
  /**
   * Role name
   *
   * @type {string}
   * @memberof Role
   */
  @Column({ nullable: false })
  name: string;
}
