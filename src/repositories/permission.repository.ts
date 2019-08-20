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
   * Returns filtered query of permission
   *
   * @param {Filters} [filters]
   * @returns {QueryBuilder<Permission>}
   * @memberof PermissionRepository
   */
  filter(filters?: Filters): QueryBuilder<Permission> {
    const query = super.filter(filters);
    if (filters && filters.search) {
      query.andLike("name", filters.search);
    }
    return query;
  }
}
