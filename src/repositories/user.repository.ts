import { EntityRepository } from "typeorm";

import { CoreRepository } from "./core.repository";
import { User } from "../entities/user.entity";
import { Filters } from "../interfaces/filters";
import { QueryBuilder } from "../utils/queryBuilder";

/**
 * User repository
 *
 * @export
 * @class UserRepository
 * @extends {CoreRepository<User>}
 */
@EntityRepository(User)
export class UserRepository extends CoreRepository<User> {
  /**
   * Returns filtered query of users
   *
   * @param {Filters} [filters]
   * @returns {SelectQueryBuilder<User>}
   * @memberof UserRepository
   */
  filter(filters?: Filters): QueryBuilder<User> {
    const query = super.filter(filters);
    if (filters && filters.search) {
      query.andLike("login", filters.search);
    }
    return query;
  }
}
