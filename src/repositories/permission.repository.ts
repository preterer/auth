import { EntityRepository } from "typeorm";

import { CoreRepository } from "./core.repository";
import { Permission } from "../entities/permission.entity";
import { QueryBuilder } from "../utils/queryBuilder";
import { PermissionFilters } from "../interfaces/filters/permission.filters";

/**
 * Permission repository
 *
 * @export
 * @class PermissionRepository
 * @extends {CoreRepository<Permission>}
 */
@EntityRepository(Permission)
export class PermissionRepository extends CoreRepository<Permission> {
  /**
   * Returns filtered query of permission
   *
   * @param {Filters} [filters]
   * @returns {QueryBuilder<Permission>}
   * @memberof PermissionRepository
   */
  filter(filters?: PermissionFilters): QueryBuilder<Permission> {
    const query = super.filter(filters);
    if (!filters) {
      return query;
    }
    const tableName = this.metadata.tableName;
    if (filters.search) {
      query.andLike(`${tableName}.name`, `%${filters.search}%`);
    }
    if (filters.userId) {
      query.innerJoin(`${tableName}.user`, "user").andEqual("user.id", filters.userId);
    }
    if (filters.roleId) {
      query.innerJoin(`${tableName}.role`, "role").andEqual("role.id", filters.roleId);
    }
    return query;
  }
}
