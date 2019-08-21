import { CoreEntity } from "../entities/core.entity";
import { CoreRepository } from "../repositories/core.repository";
import { EntityList } from "../interfaces/entityList";
import { Errors } from "../enums/errors";
import { Filters } from "../interfaces/filters";

/**
 * Abstract service to manage entities
 *
 * @export
 * @abstract
 * @class EntityService
 * @template Entity
 */
export abstract class EntityService<Entity extends CoreEntity> {
  constructor(protected readonly repository: CoreRepository<Entity>) {}

  /**
   * Gets list of entities with total count
   *
   * @param {Filters} filters
   * @returns {Promise<EntityList<Entity>>}
   * @memberof EntityService
   */
  list(filters: Filters): Promise<EntityList<Entity>> {
    return this.repository
      .filter(filters)
      .getManyAndCount()
      .then(result => ({ list: result[0], count: result[1] }));
  }

  /**
   * Gets entity by id
   *
   * @param {number} id
   * @returns {Promise<Entity>}
   * @memberof EntityService
   */
  get(id: number): Promise<Entity> {
    return this.repository.findOne(id).then(entity => {
      if (!entity) {
        throw new Error(Errors.ENTITY_NOT_FOUND);
      }
      return entity;
    });
  }

  /**
   * Adds an entity
   *
   * @param {object} model
   * @returns {Promise<Entity>}
   * @memberof EntityService
   */
  add(model: object): Promise<Entity> {
    return this.prepareModel(model).then(entityLike => this.repository.save(entityLike as any));
  }

  /**
   * Updates an entity
   *
   * @param {number} id
   * @param {object} model
   * @returns {Promise<Entity>}
   * @memberof EntityService
   */
  update(id: number, model: object): Promise<Entity> {
    return this.get(id)
      .then(() => this.prepareModel({ ...model, id }))
      .then(entityLike => this.repository.save(entityLike as any));
  }

  /**
   * Deletes an entity
   *
   * @param {number} id
   * @returns {Promise<number>}
   * @memberof EntityService
   */
  delete(id: number): Promise<number> {
    return this.get(id)
      .then(() => this.repository.delete(id))
      .then(() => id);
  }

  /**
   * Prepares model to be saved
   *
   * @protected
   * @param {object} model
   * @returns {Promise<Entity>}
   * @memberof EntityService
   */
  protected prepareModel(model: object): Promise<Entity> {
    return Promise.resolve(this.repository.create(model));
  }
}
