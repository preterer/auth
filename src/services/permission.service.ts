import { InjectRepository } from "typeorm-typedi-extensions";
import { Service, Inject } from "typedi";

import { EntityService } from "./entity.service";
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
}
