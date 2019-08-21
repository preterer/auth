import { Container } from "typedi";

import { JWTPayload } from "./interfaces/jwtPayload";
import { PermissionService } from "./services/permission.service";
import { RoleService } from "./services/role.service";

/**
 * Chcecks if an user can access an action
 *
 * @export
 * @param {JWTPayload} payload
 * @param {string[]} requiredPermissions
 * @param {("AND" | "OR")} [joinType="AND"]
 * @returns {Promise<boolean>}
 */
export function checkAccess(
  payload: JWTPayload,
  requiredPermissions: string[],
  joinType: "AND" | "OR" = "AND"
): Promise<boolean> {
  if (!requiredPermissions.length) {
    return Promise.resolve(!!payload);
  }
  if (!payload) {
    return checkUnauthorizedAccess(requiredPermissions, joinType);
  }
  return checkAuthorizedAccess(payload, requiredPermissions, joinType);
}

/**
 * Checks if an unauthorized user can acces an action
 *
 * @export
 * @param {string[]} requiredPermissions
 * @param {("AND" | "OR")} [joinType="AND"]
 * @returns {Promise<boolean>}
 */
export function checkUnauthorizedAccess(requiredPermissions: string[], joinType: "AND" | "OR"): Promise<boolean> {
  const permissionService = Container.get(PermissionService);
  const roleService = Container.get(RoleService);
  return roleService
    .getRoot()
    .then(role => joinValidations(requiredPermissions, joinType, name => permissionService.checkRole(role.id, name)));
}

/**
 * Checks if an authorized user can access an action
 *
 * @export
 * @param {JWTPayload} payload
 * @param {string[]} requiredPermissions
 * @param {("AND" | "OR")} [joinType="AND"]
 * @returns {Promise<boolean>}
 */
export function checkAuthorizedAccess(
  payload: JWTPayload,
  requiredPermissions: string[],
  joinType: "AND" | "OR"
): Promise<boolean> {
  const permissionService = Container.get(PermissionService);
  return joinValidations(requiredPermissions, joinType, name => permissionService.check(payload.id, name));
}

/**
 * Joins validations with given join type
 *
 * @param {string[]} requiredPermissions
 * @param {("AND" | "OR")} joinType
 * @param {(name: string) => Promise<boolean>} validate
 * @returns {Promise<boolean>}
 */
async function joinValidations(
  requiredPermissions: string[],
  joinType: "AND" | "OR",
  validate: (name: string) => Promise<boolean>
): Promise<boolean> {
  let isValid = false;
  for (const permission of requiredPermissions) {
    isValid = await validate(permission);
    if ((isValid && joinType === "OR") || (!isValid && joinType === "AND")) {
      break;
    }
  }
  return isValid;
}
