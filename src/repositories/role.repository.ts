import { EntityRepository } from "typeorm";

import { CoreRepository, QueryBuilder, Filters } from "@preterer/typeorm-extensions";

import { Role } from "../entities/role.entity";

/**
 * Role repository
 *
 * @export
 * @class RoleRepository
 * @extends {CoreRepository<Role>}
 */
@EntityRepository(Role)
export class RoleRepository extends CoreRepository<Role> {
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
      query.andLike(`${this.metadata.tableName}.name`, `%${filters.search}%`);
    }
    return query;
  }
}
