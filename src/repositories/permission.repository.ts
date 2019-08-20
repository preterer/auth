import { CoreRepository } from "./core.repository";
import { Filters } from "../interfaces/filters";
import { Permission } from "../entities/permission.entity";
import { QueryBuilder } from "../utils/queryBuilder";

/**
 * Permission repository
 *
 * @export
 * @class PermissionRepository
 * @extends {CoreRepository<Permission>}
 */
export class PermissionRepository extends CoreRepository<Permission> {
  /**
   * Returns permission found by name or id
   *
   * @param {(string | number)} idOrName
   * @returns {Promise<Permission>}
   * @memberof PermissionRepository
   */
  findByIdOrName(idOrName: string | number): Promise<Permission> {
    if (typeof idOrName === "string") {
      return this.findOne({ where: { name: idOrName } });
    }
    return this.findOne(idOrName);
  }

  /**
   * Returns filtered query of permission
   *
   * @param {Filters} [filters]
   * @returns {QueryBuilder<Permission>}
   * @memberof PermissionRepository
   */
  filter(filters?: Filters): QueryBuilder<Permission> {
    const query = super.filter(filters);
    if (filters && filters.search) {
      query.andLike(`${this.metadata.tableName}.name`, filters.search);
    }
    return query;
  }
}
