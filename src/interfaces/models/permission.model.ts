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
