import { Column, Entity, OneToMany } from "typeorm";

import { Permission } from "./permission.entity";
import { Tables } from "../enums/tables";
import { WithEntity } from "./withEntity.entity";

/**
 * Role entity
 *
 * @export
 * @class Role
 * @extends {CoreEntity}
 */
@Entity({ name: Tables.ROLE })
export class Role extends WithEntity {
  /**
   * Role name
   *
   * @type {string}
   * @memberof Role
   */
  @Column({ name: "name", nullable: false })
  name: string;

  /**
   * Permissions of the role
   *
   * @type {Promise<Permission[]>}
   * @memberof Role
   */
  @OneToMany(type => Permission, permission => permission.role, { nullable: true, lazy: true, cascade: true })
  permissions: Promise<Permission[]>;
}
