import { Column, Entity, OneToMany, ManyToMany, ManyToOne, JoinColumn } from "typeorm";

import { EntityWithPermissions } from "../interfaces/entityWithPermissions";
import { Permission } from "./permission.entity";
import { Tables } from "../enums/tables";
import { WithEntity } from "./withEntity.entity";
import { User } from "./user.entity";

/**
 * Role entity
 *
 * @export
 * @class Role
 * @extends {CoreEntity}
 */
@Entity({ name: Tables.ROLE })
export class Role extends WithEntity implements EntityWithPermissions {
  /**
   * Role name
   *
   * @type {string}
   * @memberof Role
   */
  @Column({ name: "name", nullable: false })
  name: string;

  /**
   * Parent role
   *
   * @type {Promise<Role>}
   * @memberof Role
   */
  @ManyToOne(type => Role, role => role.children, { nullable: true, lazy: true })
  @JoinColumn({ name: "parent_id" })
  parent?: Promise<Role>;

  /**
   * Children of the role
   *
   * @type {Promise<Role[]>}
   * @memberof Role
   */
  @OneToMany(type => Role, role => role.parent, { nullable: true, lazy: true })
  children?: Promise<Role[]>;

  /**
   * Permissions of the role
   *
   * @type {Promise<Permission[]>}
   * @memberof Role
   */
  @OneToMany(type => Permission, permission => permission.role, { nullable: true, lazy: true })
  permissions: Promise<Permission[]>;

  /**
   * Users with the role assigned
   *
   * @type {Promise<User[]>}
   * @memberof Role
   */
  @ManyToMany(type => User, user => user.roles, { nullable: true, lazy: true })
  users: Promise<User[]>;
}
