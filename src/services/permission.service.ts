import { InjectRepository } from "typeorm-typedi-extensions";
import { Service } from "typedi";

import { EntityService } from "./entity.service";
import { Permission } from "../entities/permission.entity";
import { PermissionRepository } from "../repositories/permission.repository";

/**
 * Permission management service
 *
 * @export
 * @class PermissionService
 * @extends {EntityService<Permission>}
 */
@Service()
export class PermissionService extends EntityService<Permission> {
  /**
   * Permission repository
   *
   * @protected
   * @type {PermissionRepository}
   * @memberof PermissionService
   */
  @InjectRepository(Permission)
  protected readonly repository: PermissionRepository;
}
