import { DeepPartial } from "typeorm";
import { Inject } from "typedi";

import { EntityService } from "./entity.service";
import { EntityWithPermissions } from "../interfaces/entityWithPermissions";
import { Permission } from "../entities/permission.entity";
import { PermissionService } from "./permission.service";

/**
 * Entity with permissions management abstract service
 *
 * @export
 * @abstract
 * @class EntityWithPermissionsService
 * @extends {EntityService<Entity>}
 * @template Entity
 */
export abstract class EntityWithPermissionsService<Entity extends EntityWithPermissions> extends EntityService<Entity> {
  /**
   * Permissions service
   *
   * @protected
   * @type {PermissionService}
   * @memberof EntityWithPermissionsService
   */
  @Inject(type => PermissionService)
  protected readonly permissionService: PermissionService;

  /**
   * Adds a permission to role
   *
   * @param {number} id
   * @param {(string | number)} permissionIdOrName
   * @returns {Promise<Entity>}
   * @memberof RoleRepository
   */
  async permissionAdd(id: number, permissionModel: DeepPartial<Permission>): Promise<Entity> {
    const entity = await this.get(id);
    const rolePermissions = await entity.permissions;
    const permission = await this.permissionService.add(permissionModel);
    rolePermissions.push(permission);
    entity.permissions = Promise.resolve(rolePermissions);
    return this.repository.save(entity as any);
  }

  /**
   * Removes a permission from entity
   *
   * @param {number} id
   * @param {(string | number)} permissionIdOrName
   * @returns {Promise<Entity>}
   * @memberof RoleRepository
   */
  async permissionRemove(id: number, permissionId: number): Promise<Entity> {
    const entity = await this.get(id);
    const permissions = await entity.permissions;
    this.spliceEntityOrThrow(permissions, permissionId);
    entity.permissions = Promise.resolve(permissions);
    return this.repository.save(entity as any);
  }
}
