import { InjectRepository } from "typeorm-typedi-extensions";

import { CoreRepository } from "./core.repository";
import { EntityWithPermissions } from "../interfaces/entityWithPermissions";
import { Errors } from "../enums/errors";
import { DeepPartial } from "typeorm";
import { Permission } from "../entities/permission.entity";
import { PermissionRepository } from "./permission.repository";

/**
 * Repository of entity which has related permissions
 *
 * @export
 * @class EntityWithPermissionsRepository
 * @extends {CoreRepository<Entity>}
 * @template Entity
 */
export class EntityWithPermissionsRepository<Entity extends EntityWithPermissions> extends CoreRepository<Entity> {
  @InjectRepository(Permission)
  protected readonly permissionRepository: PermissionRepository;

  /**
   * Adds a permission to role
   *
   * @param {number} id
   * @param {(string | number)} permissionIdOrName
   * @returns {Promise<Entity>}
   * @memberof RoleRepository
   */
  async addPermission(id: number, permissionModel: DeepPartial<Permission>): Promise<Entity> {
    const entity = await this.findOne(id);
    if (!entity) {
      throw new Error(Errors.ENTITY_NOT_FOUND);
    }
    const rolePermissions = await entity.permissions;
    rolePermissions.push(this.permissionRepository.create(permissionModel));
    entity.permissions = Promise.resolve(rolePermissions);
    return this.save((entity as any) as DeepPartial<Entity>);
  }

  /**
   * Removes a permission from role
   *
   * @param {number} id
   * @param {(string | number)} permissionIdOrName
   * @returns {Promise<Entity>}
   * @memberof RoleRepository
   */
  async removePermission(id: number, permissionId: number): Promise<Entity> {
    const entity = await this.findOne(id);
    if (!entity) {
      throw new Error(Errors.ENTITY_NOT_FOUND);
    }
    const entityPermissions = await entity.permissions;
    const permissionIndex = entityPermissions.findIndex(perm => perm.id === permissionId);
    if (permissionIndex < 0) {
      throw new Error(Errors.ENTITY_NOT_FOUND);
    }
    entityPermissions.splice(permissionIndex, 1);
    entity.permissions = Promise.resolve(entityPermissions);
    return this.save((entity as any) as DeepPartial<Entity>);
  }
}
