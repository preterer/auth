/**
 * Model of a permission
 *
 * @export
 * @interface PermissionModel
 */
export interface PermissionModel {
  /**
   * Permission name
   *
   * @type {string}
   * @memberof PermissionModel
   */
  name: string;

  /**
   * Id of related entity
   *
   * @type {string}
   * @memberof PermissionModel
   */
  entityId?: string;

  /**
   * Type of related entity
   *
   * @type {string}
   * @memberof PermissionModel
   */
  entityType?: string;

  /**
   * Is permission inherited
   *
   * @type {boolean}
   * @memberof PermissionModel
   */
  inherited?: boolean;

  /**
   * Id of role to insert the permission into
   *
   * @type {number}
   * @memberof PermissionModel
   */
  roleId?: number;

  /**
   * Id of user to insert the permission into
   *
   * @type {number}
   * @memberof PermissionModel
   */
  userId?: number;
}
