import bcrypt from "bcrypt";
import { Entity, Column, OneToMany, ManyToMany, JoinTable, BeforeInsert, BeforeUpdate } from "typeorm";

import { CoreEntity } from "./core.entity";
import { Permission } from "./permission.entity";
import { Tables } from "../enums/tables";
import { Role } from "./role.entity";

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

  /**
   * Permissions of the user
   *
   * @type {Promise<Permission[]>}
   * @memberof User
   */
  @OneToMany(type => Permission, permission => permission.role, { nullable: true, lazy: true, cascade: true })
  permissions: Promise<Permission[]>;

  /**
   * Roles of the user
   *
   * @type {Promise<Role[]>}
   * @memberof User
   */
  @ManyToMany(type => Permission, { nullable: true, lazy: true })
  @JoinTable({ name: Tables.USER_ROLES })
  roles: Promise<Role[]>;

  /**
   * Hashes user password
   *
   * @memberof User
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }
}
