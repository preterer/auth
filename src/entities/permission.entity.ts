import { Entity, ManyToOne, JoinColumn, Column } from "typeorm";

import { Role } from "./role.entity";
import { Tables } from "../enums/tables";
import { User } from "./user.entity";
import { WithEntity } from "./withEntity.entity";

/**
 * Permission entity
 *
 * @export
 * @class Permission
 * @extends {CoreEntity}
 */
@Entity({ name: Tables.PERMISSION })
export class Permission extends WithEntity {
  /**
   * Permission name
   *
   * @type {string}
   * @memberof Permission
   */
  @Column({ name: "name" })
  name: string;

  /**
   * Is permission inherited
   *
   * @type {boolean}
   * @memberof Permission
   */
  @Column({ name: "inherited", nullable: false, default: false })
  inherited: boolean;

  /**
   * Role that contains the permission
   *
   * @type {Promise<Role>}
   * @memberof Permission
   */
  @ManyToOne(type => Role, role => role.permissions, { lazy: true, nullable: true })
  @JoinColumn({ name: "role_id", referencedColumnName: "id" })
  role?: Promise<Role>;

  /**
   * User that has the permission
   *
   * @type {Promise<User>}
   * @memberof Permission
   */
  @ManyToOne(type => User, { lazy: true, nullable: true })
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  user?: Promise<User>;
}
