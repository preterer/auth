/**
 * Model of a role
 *
 * @export
 * @interface RoleModel
 */
export interface RoleModel {
  /**
   * Identifier of the role
   *
   * @type {number}
   * @memberof RoleModel
   */
  id?: number;

  /**
   * Name of the role
   *
   * @type {string}
   * @memberof RoleModel
   */
  name?: string;

  /**
   * Id of parent role
   *
   * @type {number}
   * @memberof RoleModel
   */
  parentId?: number;
}
