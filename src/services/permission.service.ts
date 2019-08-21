import { InjectRepository } from "typeorm-typedi-extensions";
import { Service, Inject } from "typedi";

import { EntityService, QueryBuilder } from "@preterer/typeorm-extensions";

import { Permission } from "../entities/permission.entity";
import { PermissionRepository } from "../repositories/permission.repository";
import { PermissionModel } from "../interfaces/models/permission.model";
import { RoleService } from "./role.service";
import { UserService } from "./user.service";

/**
 * Permission management service
 *
 * @export
 * @class PermissionService
 * @extends {EntityService<Permission>}
 */
@Service()
export class PermissionService extends EntityService<Permission, PermissionModel> {
  /**
   * Permission repository
   *
   * @protected
   * @type {PermissionRepository}
   * @memberof PermissionService
   */
  @InjectRepository(Permission)
  protected readonly repository: PermissionRepository;

  /**
   * Role service
   *
   * @protected
   * @type {RoleService}
   * @memberof PermissionService
   */
  @Inject(type => RoleService)
  protected readonly roleService: RoleService;

  /**
   * User service
   *
   * @protected
   * @type {UserService}
   * @memberof PermissionService
   */
  @Inject(type => UserService)
  protected readonly userService: UserService;

  /**
   * Prepares permission model to be saved into database
   *
   * @param {PermissionModel} permissionModel
   * @returns {Promise<Permission>}
   * @memberof PermissionService
   */
  async prepareModel(permissionModel: PermissionModel): Promise<Permission> {
    const permission = this.repository.create(permissionModel);
    if (permissionModel.roleId) {
      permission.role = Promise.resolve(await this.roleService.get(permissionModel.roleId));
    }
    if (permissionModel.userId) {
      permission.user = Promise.resolve(await this.userService.get(permissionModel.userId));
    }

    return permission;
  }

  /**
   * Checks if user has given permission
   *
   * @param {number} userId
   * @param {string} permissionName
   * @param {string} [entityId]
   * @param {string} [entityType]
   * @returns {Promise<boolean>}
   * @memberof PermissionService
   */
  check(userId: number, permissionName: string, entityId?: string, entityType?: string): Promise<boolean> {
    const query = this.repository
      .createQueryBuilder("permission")
      .andEqual("permission.name", permissionName)
      .leftJoin("permission.user", "user")
      .leftJoin("permission.role", "role")
      .leftJoin("role.users", "roleUser")
      .andWhere("(user.id = :userId OR roleUser.id = :userId)", { userId });
    this.applyEntityQuery(query, entityId, entityType);
    return query.getCount().then(count => count > 0);
  }

  /**
   * Checks if role has given permission
   *
   * @param {number} roleId
   * @param {string} permissionName
   * @param {string} [entityId]
   * @param {string} [entityType]
   * @returns {Promise<boolean>}
   * @memberof PermissionService
   */
  checkRole(roleId: number, permissionName: string, entityId?: string, entityType?: string): Promise<boolean> {
    const query = this.repository
      .createQueryBuilder("permission")
      .andEqual("permission.name", permissionName)
      .innerJoin("permission.role", "role")
      .andEqual("role.id", roleId);
    this.applyEntityQuery(query, entityId, entityType);
    return query.getCount().then(count => count > 0);
  }

  private applyEntityQuery(
    query: QueryBuilder<Permission>,
    entityId?: string,
    entityType?: string
  ): QueryBuilder<Permission> {
    const roleEntityIsNull = "(role.entityId IS NULL AND role.entityType IS NULL)";
    const permissionEntityIsNull = "(permission.entityId IS NULL AND permission.entityType IS NULL)";

    if (entityId && entityType) {
      const roleEntityMatches = "(role.entityId = :entityId AND role.entityType = :entityType)";
      const permissionEntityMatches = "(permission.entityId = :entityId AND permission.entityType = :entityType)";
      const q = `( (${roleEntityMatches} OR ${roleEntityIsNull}) AND (${permissionEntityIsNull} OR ${permissionEntityMatches}) )`;

      query.andWhere(q, { entityId, entityType });
    } else {
      query.andWhere(`(${roleEntityIsNull} AND ${permissionEntityIsNull})`);
    }
    return query;
  }
}
