import { Filters } from "./filters";

/**
 * Filters of permissions
 *
 * @export
 * @interface RoleFilters
 * @extends {Filters}
 */
export interface PermissionFilters extends Filters {
  /**
   * Id of role which permissions should belong to
   *
   * @type {number}
   * @memberof PermissionFilters
   */
  roleId?: number;

  /**
   * Id of user which permissions should belong to
   *
   * @type {number}
   * @memberof PermissionFilters
   */
  userId?: number;

  /**
   * Find only inherited permissions
   *
   * @type {boolean}
   * @memberof PermissionFilters
   */
  inheritedOnly?: boolean;
}
