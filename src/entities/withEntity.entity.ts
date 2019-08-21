import { Column } from "typeorm";

import { CoreEntity } from "@preterer/typeorm-extensions";

/**
 * Fields of entity with related entity
 *
 * @export
 * @abstract
 * @class WithEntity
 * @extends {CoreEntity}
 */
export abstract class WithEntity extends CoreEntity {
  /**
   * Related entity id
   *
   * @type {string}
   * @memberof Role
   */
  @Column({ name: "entity_id", nullable: true })
  entityId: string;

  /**
   * Related entity type
   *
   * @type {string}
   * @memberof Role
   */
  @Column({ name: "entity_type", nullable: true })
  entityType: string;
}
