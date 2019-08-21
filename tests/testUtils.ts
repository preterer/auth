import Container from "typedi";
import * as TypeORM from "typeorm";
import { DeepPartial } from "typeorm";

import { Permission } from "../src/entities/permission.entity";
import { Role } from "../src/entities/role.entity";
import { RoleService } from "../src/services/role.service";
import { User } from "../src/entities/user.entity";
import { UserService } from "../src/services/user.service";

/**
 * Mocks in memory DB
 *
 * @export
 * @returns
 */
export function mockDB(): Promise<TypeORM.Connection> {
  TypeORM.useContainer(Container);
  return TypeORM.createConnection({
    type: "sqljs",
    entities: [User, Role, Permission],
    logger: "advanced-console",
    logging: ["error"],
    dropSchema: true,
    synchronize: true,
    cache: false
  });
}

/**
 * Mock some test data
 *
 * @export
 * @param {number} [amounts=5]
 * @returns {Promise<{ userId: number; roleId: number; amounts: number; rootRole: DeepPartial<Role> }>}
 */
export async function mockData(
  amounts = 5
): Promise<{ userId: number; roleId: number; amounts: number; rootRole: DeepPartial<Role> }> {
  const userService = Container.get(UserService);
  const roleService = Container.get(RoleService);

  const rootRole = await roleService.add({ name: "Root" });

  let userId: number, roleId: number;
  for (let i = 1; i <= amounts; i++) {
    userId = await userService.add(userData(i)).then(user => user.id);
    roleId = await roleService.add({ name: roleName(i) }).then(role => role.id);
  }
  return { userId, roleId, amounts, rootRole };
}

/**
 * Clears mocked data
 *
 * @export
 * @returns {Promise<void>}
 */
export async function clearData(): Promise<void> {
  await TypeORM.getRepository(Permission).clear();
  await TypeORM.getRepository(Role).clear();
  await TypeORM.getRepository(User).clear();
}

/**
 * Creates test user data
 *
 * @export
 * @param {number} id
 * @returns {DeepPartial<User>}
 */
export function userData(id: number): { login: string; password: string } {
  return {
    login: `testUser_${id}`,
    password: `testPassword_${id}`
  };
}

/**
 * Creates test role name
 *
 * @export
 * @param {number} id
 * @returns
 */
export function roleName(id: number) {
  return `role_${id}`;
}
