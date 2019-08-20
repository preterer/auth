import { Repository } from "typeorm";

import { CoreEntity } from "../entities/core.entity";
import { Filters } from "../interfaces/filters";
import { QueryBuilder } from "../utils/queryBuilder";

/**
 * Core of a repository
 *
 * @export
 * @class CoreRepository
 * @extends {Repository<Entity>}
 * @template Entity
 */
export abstract class CoreRepository<Entity extends CoreEntity> extends Repository<Entity> {
  /**
   * Returns query builder with applied filters
   *
   * @param {Filters} [filters]
   * @returns {SelectQueryBuilder<Entity>}
   * @memberof CoreRepository
   */
  filter(filters: Filters = { limit: 20, start: 0, order: "id", desc: false }): QueryBuilder<Entity> {
    return new QueryBuilder(this.createQueryBuilder(this.metadata.tableName))
      .limit(filters.limit)
      .skip(filters.start)
      .orderBy({ [filters.order]: filters.desc ? "ASC" : "DESC" });
  }
}
