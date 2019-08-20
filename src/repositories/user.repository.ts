import { EntityRepository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { EntityWithPermissionsRepository } from "./entityWithPermissions.repository";
import { Errors } from "../enums/errors";
import { Filters } from "../interfaces/filters";
import { QueryBuilder } from "../utils/queryBuilder";
import { Role } from "../entities/role.entity";
import { RoleRepository } from "./role.repository";
import { User } from "../entities/user.entity";

/**
 * User repository
 *
 * @export
 * @class UserRepository
 * @extends {CoreRepository<User>}
 */
@EntityRepository(User)
export class UserRepository extends EntityWithPermissionsRepository<User> {
  @InjectRepository(Role)
  protected readonly roleRepository: RoleRepository;

  /**
   * Adds an user role
   *
   * @param {number} id
   * @param {number} roleId
   * @returns {Promise<User>}
   * @memberof UserRepository
   */
  async roleAdd(id: number, roleId: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error(Errors.ENTITY_NOT_FOUND);
    }
    const role = await this.roleRepository.findOne(roleId);
    if (!role) {
      throw new Error(Errors.ENTITY_NOT_FOUND);
    }
    const userRoles = await user.roles;
    userRoles.push(role);
    user.roles = Promise.resolve(userRoles);
    return this.save(user);
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
    const user = await this.findOne(id);
    if (!user) {
      throw new Error(Errors.ENTITY_NOT_FOUND);
    }
    const userRoles = await user.roles;
    const roleIndex = userRoles.findIndex(role => role.id === roleId);
    if (roleIndex < 0) {
      throw new Error(Errors.ENTITY_NOT_FOUND);
    }
    userRoles.splice(roleIndex, 1);
    user.roles = Promise.resolve(userRoles);
    return this.save(user);
  }

  /**
   * Returns filtered query of users
   *
   * @param {Filters} [filters]
   * @returns {SelectQueryBuilder<User>}
   * @memberof UserRepository
   */
  filter(filters?: Filters): QueryBuilder<User> {
    const query = super.filter(filters);
    if (filters && filters.search) {
      query.andLike(`${this.metadata.tableName}.login`, `%${filters.search}%`);
    }
    return query;
  }
}
