import { InjectRepository } from "typeorm-typedi-extensions";
import { Service, Inject } from "typedi";

import { EntityService } from "./entity.service";
import { Errors } from "../enums/errors";
import { PermissionService } from "./permission.service";
import { Role } from "../entities/role.entity";
import { RoleRepository } from "../repositories/role.repository";
import { RoleModel } from "../interfaces/models/role.model";
import { PermissionFilters } from "../interfaces/filters/permission.filters";

/**
 * Role management service
 *
 * @export
 * @class RoleService
 * @extends {EntityService<Role>}
 */
@Service()
export class RoleService extends EntityService<Role, RoleModel> {
  /**
   * Role repository
   *
   * @protected
   * @type {RoleRepository}
   * @memberof RoleService
   */
  @InjectRepository(Role)
  protected readonly repository: RoleRepository;

  /**
   * Permission service
   *
   * @protected
   * @type {PermissionService}
   * @memberof RoleService
   */
  @Inject(type => PermissionService)
  protected readonly permissionService: PermissionService;

  /**
   * Gets the root role without any parent
   *
   * @returns {Promise<Role>}
   * @memberof RoleService
   */
  getRoot(): Promise<Role> {
    return this.repository
      .createQueryBuilder("role")
      .leftJoin("role.parent", "parent")
      .where("parent.id IS NULL")
      .getOne();
  }

  /**
   * Adds a role
   *
   * @param {RoleModel} model
   * @returns {Promise<Role>}
   * @memberof RoleService
   */
  async add(model: RoleModel): Promise<Role> {
    const role = await super.add(model);
    await this.copyPermissions(model.parentId, role.id);
    return role;
  }

  /**
   * Updates a roles
   *
   * @param {number} id
   * @param {RoleModel} model
   * @returns {Promise<Role>}
   * @memberof RoleService
   */
  async update(id: number, model: RoleModel): Promise<Role> {
    const role = await super.update(id, model);
    if (model.parentId) {
      await this.removeInheritedPermissions(id);
      await this.copyPermissions(model.parentId, id);
    }
    return role;
  }

  /**
   * Deletes a role
   *
   * @param {number} id
   * @returns {Promise<number>}
   * @memberof RoleService
   */
  async delete(id: number): Promise<number> {
    const role = await this.get(id);
    const parent = await role.parent;
    if (!parent) {
      throw new Error(Errors.ROLE_ROOT_CANNOT_BE_DELETED);
    }
    const permissions = await this.permissionService.list({ limit: -1, roleId: id } as PermissionFilters);
    if (permissions.count) {
      await this.permissionService.deleteMultiple(permissions.list.map(permission => permission.id));
    }
    await this.repository.delete(id);
    return id;
  }

  /**
   * Copies permissions from one role, to another
   *
   * @param {number} fromId
   * @param {number} toId
   * @returns {Promise<void>}
   * @memberof RoleService
   */
  async copyPermissions(fromId: number, toId: number): Promise<void> {
    const permissions = await this.permissionService.list({ limit: -1, roleId: fromId } as PermissionFilters);
    await Promise.all(
      permissions.list.map(permission =>
        this.permissionService.add({
          name: permission.name,
          entityId: permission.entityId,
          entityType: permission.entityType,
          roleId: toId,
          inherited: true
        })
      )
    );
  }

  /**
   * Removes inherited permissions
   *
   * @param {number} roleId
   * @returns {Promise<void>}
   * @memberof RoleService
   */
  async removeInheritedPermissions(roleId: number): Promise<void> {
    const permissions = await this.permissionService.list({
      limit: -1,
      roleId,
      inheritedOnly: true
    } as PermissionFilters);
    if (permissions.count) {
      await this.permissionService.deleteMultiple(permissions.list.map(permission => permission.id));
    }
  }

  /**
   * Prepares role model to be saved into database
   *
   * @protected
   * @param {RoleModel} model
   * @returns {Promise<Role>}
   * @memberof RoleService
   */
  protected async prepareModel(model: RoleModel): Promise<Role> {
    const role = this.repository.create(model);
    if (!model.parentId && !model.id) {
      throw new Error(Errors.ROLE_REQUIRES_PARENT);
    }
    if (model.id === model.parentId) {
      throw new Error(Errors.ROLE_CANNOT_BE_ITS_PARENT);
    }
    if (model.id && model.parentId) {
      const parent = await this.get(model.id).then(role => role.parent);
      if (!parent) {
        throw new Error(Errors.ROLE_ROOT_CANNOT_BE_DELETED);
      }
    }
    if (model.parentId) {
      role.parent = Promise.resolve(await this.get(model.parentId));
    }
    return role;
  }
}
