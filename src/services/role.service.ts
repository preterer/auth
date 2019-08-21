import { InjectRepository } from "typeorm-typedi-extensions";
import { Service } from "typedi";

import { EntityService } from "./entity.service";
import { Role } from "../entities/role.entity";
import { RoleRepository } from "../repositories/role.repository";
import { RoleModel } from "../interfaces/models/role.model";
import { Errors } from "../enums/errors";

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

  async delete(id: number): Promise<number> {
    const role = await this.get(id);
    const parent = await role.parent;
    if (!parent) {
      throw new Error(Errors.ROLE_ROOT_CANNOT_BE_DELETED);
    }
    await this.repository.delete(id);
    return id;
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
    if (model.parentId) {
      role.parent = Promise.resolve(await this.get(model.parentId));
    }
    return role;
  }
}
