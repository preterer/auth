import { SelectQueryBuilder } from "typeorm";

import { CoreEntity } from "../entities/core.entity";

/**
 * Extended query builder
 *
 * @export
 * @class QueryBuilder
 * @extends {SelectQueryBuilder<Entity>}
 * @template Entity
 */
export class QueryBuilder<Entity extends CoreEntity> extends SelectQueryBuilder<Entity> {
  /**
   * Adds a where clause with LIKE
   *
   * @param {string} field
   * @param {string} value
   * @returns {QueryBuilder<Entity>}
   * @memberof QueryBuilder
   */
  andLike(field: string, value: string): QueryBuilder<Entity> {
    return this.andWhere(`${this.tableName}.${field} LIKE :like${field}`, { [`like${field}`]: value });
  }

  constructor(queryBuilder: SelectQueryBuilder<Entity>, public tableName: string) {
    super(queryBuilder);
  }
}
