import { DeepPartial } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Service, Inject } from "typedi";

import { EntityService } from "./entity.service";
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
   * Role service
   *
   * @protected
   * @type {RoleRepository}
   * @memberof UserService
   */
  @Inject(type => RoleService)
  protected readonly roleService: RoleService;

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
