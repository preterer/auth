import { EntityRepository } from "typeorm";

import { EntityWithPermissionsRepository } from "./entityWithPermissions.repository";
import { Filters } from "../interfaces/filters";
import { QueryBuilder } from "../utils/queryBuilder";
import { Role } from "../entities/role.entity";

/**
 * Role repository
 *
 * @export
 * @class RoleRepository
 * @extends {CoreRepository<Role>}
 */
@EntityRepository(Role)
export class RoleRepository extends EntityWithPermissionsRepository<Role> {
  /**
   * Returns filtered query of roles
   *
   * @param {Filters} [filters]
   * @returns {QueryBuilder<Role>}
   * @memberof RoleRepository
   */
  filter(filters?: Filters): QueryBuilder<Role> {
    const query = super.filter(filters);
    if (filters && filters.search) {
      query.andLike(`${this.metadata.tableName}.name`, filters.search);
    }
    return query;
  }
}
