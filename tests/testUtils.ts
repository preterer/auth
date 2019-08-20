import Container from "typedi";
import * as TypeORM from "typeorm";
import { DeepPartial } from "typeorm";

import { Permission } from "../src/entities/permission.entity";
import { PermissionRepository } from "../src/repositories/permission.repository";
import { Role } from "../src/entities/role.entity";
import { RoleRepository } from "../src/repositories/role.repository";
import { User } from "../src/entities/user.entity";
import { UserRepository } from "../src/repositories/user.repository";

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
  const userRepository = TypeORM.getCustomRepository(UserRepository);
  const roleRepository = TypeORM.getCustomRepository(RoleRepository);
  const permissionRepository = TypeORM.getCustomRepository(PermissionRepository);

  const rootRole = await permissionRepository.save({ name: "Root", created: new Date(), modified: new Date() });

  let userId: number, roleId: number;
  for (let i = 1; i <= amounts; i++) {
    userId = await userRepository.save(userData(i)).then(user => user.id);
    roleId = await roleRepository.save({ name: roleName(i) }).then(role => role.id);
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
export function userData(id: number): DeepPartial<User> {
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
