import { InjectRepository } from "typeorm-typedi-extensions";
import { Service } from "typedi";

import { EntityService } from "./entity.service";
import { Role } from "../entities/role.entity";
import { RoleRepository } from "../repositories/role.repository";

/**
 * Role management service
 *
 * @export
 * @class RoleService
 * @extends {EntityService<Role>}
 */
@Service()
export class RoleService extends EntityService<Role> {
  /**
   * Role repository
   *
   * @protected
   * @type {RoleRepository}
   * @memberof RoleService
   */
  @InjectRepository(Role)
  protected readonly repository: RoleRepository;
}
