import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DeepPartial } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Service, Inject } from "typedi";

import { EntityService } from "@preterer/typeorm-extensions";

import { AuthConfig } from "../config";
import { Errors } from "../enums/errors";
import { LoginData } from "../interfaces/models/loginData.model";
import { PermissionFilters } from "../interfaces/filters/permission.filters";
import { PermissionService } from "./permission.service";
import { RoleService } from "./role.service";
import { User } from "../entities/user.entity";
import { UserRepository } from "../repositories/user.repository";

/**
 * User management service
 *
 * @export
 * @class UserService
 * @extends {EntityService<User>}
 */
@Service()
export class UserService extends EntityService<User, DeepPartial<User>> {
  /**
   * User repository
   *
   * @protected
   * @type {UserRepository}
   * @memberof UserService
   */
  @InjectRepository(User)
  protected repository: UserRepository;

  /**
   * Configuration
   *
   * @protected
   * @type {AuthConfig}
   * @memberof UserService
   */
  @Inject(type => AuthConfig)
  protected readonly config: AuthConfig;

  /**
   * Permission service
   *
   * @protected
   * @type {PermissionService}
   * @memberof UserService
   */
  @Inject(type => PermissionService)
  protected readonly permissionService: PermissionService;

  /**
   * Role service
   *
   * @protected
   * @type {RoleRepository}
   * @memberof UserService
   */
  @Inject(type => RoleService)
  protected readonly roleService: RoleService;

  /**
   * Gets user by login
   *
   * @param {string} login
   * @returns {Promise<User>}
   * @memberof UserService
   */
  getByLogin(login: string): Promise<User> {
    return this.repository.findOne({ where: { login } });
  }

  /**
   * Deletes an user
   *
   * @param {number} id
   * @returns {Promise<number>}
   * @memberof UserService
   */
  async delete(id: number): Promise<number> {
    await this.get(id);
    const permissions = await this.permissionService.list({ limit: -1, userId: id } as PermissionFilters);
    if (permissions.count) {
      await this.permissionService.deleteMultiple(permissions.list.map(permission => permission.id));
    }
    await this.repository.delete(id);
    return id;
  }

  /**
   * Returns JWT token of logged in user
   *
   * @param {LoginData} loginData
   * @returns {Promise<string>}
   * @memberof UserService
   */
  async login(loginData: LoginData): Promise<string> {
    const user = await this.getByLogin(loginData.login);
    if (!user) {
      throw new Error(Errors.INCORRECT_LOGIN_DATA);
    }
    await this.verifyPassword(user, loginData.password);
    return jwt.sign({ id: user.id }, this.config.jwtSecret);
  }

  /**
   * Verifies user password
   *
   * @param {User} user
   * @param {string} password
   * @returns {Promise<void>}
   * @memberof UserService
   */
  async verifyPassword(user: User, password: string): Promise<void> {
    const passwordsMatching = await bcrypt.compare(password, user.password);
    if (!passwordsMatching) {
      throw new Error(Errors.INCORRECT_LOGIN_DATA);
    }
  }

  /**
   * Adds an user role
   *
   * @param {number} id
   * @param {number} roleId
   * @returns {Promise<User>}
   * @memberof UserRepository
   */
  async roleAdd(id: number, roleId: number): Promise<User> {
    const user = await this.get(id);
    const role = await this.roleService.get(roleId);
    const userRoles = await user.roles;
    userRoles.push(role);
    user.roles = Promise.resolve(userRoles);
    return this.repository.save(user);
  }

  /**
   * Removes an user role
   *
   * @param {number} id
   * @param {number} roleId
   * @returns {Promise<User>}
   * @memberof UserRepository
   */
  async roleRemove(id: number, roleId: number): Promise<User> {
    const user = await this.get(id);
    const roles = await user.roles;
    this.spliceEntityOrThrow(roles, roleId);
    user.roles = Promise.resolve(roles);
    return this.repository.save(user);
  }
}
