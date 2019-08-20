import { Repository, QueryRunner } from "typeorm";

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
   * Creates an extended QueryBuilder
   *
   * @param {string} [alias]
   * @param {QueryRunner} [queryRunner]
   * @returns {QueryBuilder<Entity>}
   * @memberof CoreRepository
   */
  createQueryBuilder(alias?: string, queryRunner?: QueryRunner): QueryBuilder<Entity> {
    return new QueryBuilder(super.createQueryBuilder(alias, queryRunner));
  }

  /**
   * Returns query builder with applied filters
   *
   * @param {Filters} [filters]
   * @returns {SelectQueryBuilder<Entity>}
   * @memberof CoreRepository
   */
  filter(filters: Filters = { limit: 20, start: 0, order: "id", desc: false }): QueryBuilder<Entity> {
    return this.createQueryBuilder(this.metadata.tableName)
      .limit(filters.limit)
      .skip(filters.start)
      .orderBy({ [filters.order]: filters.desc ? "ASC" : "DESC" });
  }

  /**
   * Saves model data
   *
   * @param {*} model
   * @returns {Promise<Entity>}
   * @memberof CoreRepository
   */
  saveModel(model: any): Promise<Entity> {
    if (!(model instanceof CoreEntity)) {
      model = this.create(model);
    }
    return this.save(model);
  }
}
