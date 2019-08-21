import { CoreEntity } from "@preterer/typeorm-extensions";

import { Permission } from "../entities/permission.entity";

/**
 * Entity which has permissions
 *
 * @export
 * @interface EntityWithPermissions
 * @extends {CoreEntity}
 */
export interface EntityWithPermissions extends CoreEntity {
  /**
   * Permissions of the entity
   *
   * @type {Promise<Permission[]>}
   * @memberof EntityWithPermissions
   */
  permissions?: Promise<Permission[]>;
}
