/**
 * All available error messages
 *
 * @export
 * @enum {number}
 */
export enum Errors {
  ENTITY_NOT_FOUND = "Entity not found.",
  INCORRECT_LOGIN_DATA = "Incorrect login or password.",
  ROLE_REQUIRES_PARENT = "Cannot add role without a parent.",
  ROLE_ROOT_CANNOT_BE_DELETED = "Cannot delete root role."
}
