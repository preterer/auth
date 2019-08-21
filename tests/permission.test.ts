import { Container } from "typedi";

import { PermissionFilters } from "../src/interfaces/filters/permission.filters";
import { PermissionService } from "../src/services/permission.service";
import { UserService } from "../src/services/user.service";

import { mockDB, mockData, clearData } from "./testUtils";
import { RoleService } from "../src/services/role.service";

describe("Permission", function() {
  let permissionService: PermissionService,
    roleService: RoleService,
    userService: UserService,
    userId: number,
    roleId: number;

  beforeAll(async function() {
    await mockDB();
    permissionService = Container.get(PermissionService);
    roleService = Container.get(RoleService);
    userService = Container.get(UserService);
  });

  beforeEach(async function() {
    const data = await mockData();
    userId = data.userId;
    roleId = data.roleId;
  });

  afterEach(async function() {
    await clearData();
  });

  describe("add", function() {
    it("should allow to add a permission for user", async function() {
      const permission = await permissionService.add({ name: "test", userId });
      expect(permission).not.toBeUndefined();
      const permissionFromDb = await permissionService.get(permission.id);
      const user = await permissionFromDb.user;
      expect(user).not.toBeUndefined();
      expect(user.id).toBe(userId);
    });

    it("should allow to add a permission for role", async function() {
      const permission = await permissionService.add({ name: "test", roleId });
      expect(permission).not.toBeUndefined();
      const permissionFromDb = await permissionService.get(permission.id);
      const role = await permissionFromDb.role;
      expect(role).not.toBeUndefined();
      expect(role.id).toBe(roleId);
    });
  });

  describe("list", function() {
    it("should find a permission", async function() {
      const name = "TEST permission Search";
      await permissionService.add({ name });
      const searches = [name, name.slice(0, 4), name.slice(4, 8), name.slice(name.length - 5, name.length - 1)];
      for (const search of searches) {
        const results = await permissionService.list({ search });
        expect(results.list.length).toBeGreaterThan(0);
        expect(results.count).toBeGreaterThan(0);
      }
    });

    it("should not find permission with name that doesn't match search", async function() {
      const name = "TEST permission Search";
      await permissionService.add({ name });
      const results = await permissionService.list({ search: "8a89eseaej9a8sjeaskle" });
      expect(results.list.length).toBe(0);
      expect(results.count).toBe(0);
    });

    it("should find some permissions with default filters", async function() {
      const name = "TEST permission Search";
      const amount = 100;
      for (let i = 0; i < amount; i++) {
        await permissionService.add({ name: `${name}_${i}` });
      }
      const results = await permissionService.list();
      expect(results.list.length).toBeGreaterThan(0);
      expect(results.count).toBe(amount);
    });

    it("should find all permissions", async function() {
      const name = "TEST permission Search";
      const amount = 100;
      for (let i = 0; i < amount; i++) {
        await permissionService.add({ name: `${name}_${i}` });
      }
      const results = await permissionService.list({ limit: amount });
      expect(results.list.length).toBe(amount);
      expect(results.count).toBe(amount);
    });

    it("should find permissions related to user", async function() {
      const name = "TEST permission Search";
      const amount = 100;
      for (let i = 0; i < amount; i++) {
        await permissionService.add({ name: `${name}_${i}`, userId });
        await permissionService.add({ name: `${name}_${i}`, roleId });
      }
      const results = await permissionService.list({ userId, limit: amount * 2 } as PermissionFilters);
      expect(results.list.length).toBe(amount);
      expect(results.count).toBe(amount);
    });

    it("should find permissions related to role", async function() {
      const name = "TEST permission Search";
      const amount = 100;
      for (let i = 0; i < amount; i++) {
        await permissionService.add({ name: `${name}_${i}`, userId });
        await permissionService.add({ name: `${name}_${i}`, roleId });
      }
      const results = await permissionService.list({ roleId, limit: amount * 2 } as PermissionFilters);
      expect(results.list.length).toBe(amount);
      expect(results.count).toBe(amount);
    });
  });

  describe("check", function() {
    const name = "REQUIRED_PERMISSION";
    const entityId = "123";
    const entityType = "entityType";
    let roleWithEntityId: number;

    beforeEach(async function() {
      roleWithEntityId = await roleService
        .add({ name: "Test role", parentId: roleId, entityId, entityType })
        .then(role => role.id);
      await userService.roleAdd(userId, roleId);
      await userService.roleAdd(userId, roleWithEntityId);
    });

    it("should succeed when user has required permission", async function() {
      await permissionService.add({ name, userId });
      const success = await permissionService.check(userId, name);
      expect(success).toBeTruthy();
    });

    it("should succeed when user has a role with required permission", async function() {
      await permissionService.add({ name, roleId });
      const success = await permissionService.check(userId, name);
      expect(success).toBeTruthy();
    });

    it("should succeed when user has required permission with entity", async function() {
      await permissionService.add({ name, userId, entityId, entityType });
      const success = await permissionService.check(userId, name, entityId, entityType);
      expect(success).toBeTruthy();
    });

    it("should succeed when user has a role with required permission with entity", async function() {
      await permissionService.add({ name, roleId, entityId, entityType });
      const success = await permissionService.check(userId, name, entityId, entityType);
      expect(success).toBeTruthy();
    });

    it("should succeed when user has a role with entity with required permission", async function() {
      await userService.roleAdd(userId, roleWithEntityId);
      await permissionService.add({ name, roleId: roleWithEntityId });
      const success = await permissionService.check(userId, name, entityId, entityType);
      expect(success).toBeTruthy();
    });

    it("should fail when user doesn't have the required permission", async function() {
      const success = await permissionService.check(userId, name);
      expect(success).toBeFalsy();
    });

    it("should fail when user has the required permission but with wrong entity", async function() {
      await permissionService.add({ name, userId, entityId: "some_other_id", entityType });
      const success = await permissionService.check(userId, name, entityId, entityType);
      expect(success).toBeFalsy();
    });

    it("should fail when user has the required permission with entity but it requieres full access", async function() {
      await permissionService.add({ name, userId, entityId: entityId, entityType });
      const success = await permissionService.check(userId, name);
      expect(success).toBeFalsy();
    });

    it("should fail when user has a role with the required permission but with wrong entity", async function() {
      await permissionService.add({ name, roleId, entityId: entityId, entityType: "something_else" });
      const success = await permissionService.check(userId, name, entityId, entityType);
      expect(success).toBeFalsy();
    });

    it("should fail when user has a role with the required permission with entity but it requires full access", async function() {
      await permissionService.add({ name, roleId, entityId: entityId, entityType });
      const success = await permissionService.check(userId, name);
      expect(success).toBeFalsy();
    });

    it("should fail when user has a role with with the required permission but role has wrong entity", async function() {
      const newRoleId: number = await roleService
        .add({ name: "Test role 2", parentId: roleId, entityId: "wrong id", entityType })
        .then(role => role.id);
      await userService.roleAdd(userId, newRoleId);
      await permissionService.add({ name, roleId: newRoleId });
      const success = await permissionService.check(userId, name, entityId, entityType);
      expect(success).toBeFalsy();
    });

    it("should fail when user has a role with the required permission but role has an entity and it requires full access", async function() {
      const newRoleId: number = await roleService
        .add({ name: "Test role 2", parentId: roleId, entityId, entityType })
        .then(role => role.id);
      await userService.roleAdd(userId, newRoleId);
      await permissionService.add({ name, roleId: newRoleId });
      const success = await permissionService.check(userId, name);
      expect(success).toBeFalsy();
    });
  });

  describe("check role", function() {
    const name = "REQUIRED_PERMISSION";
    const entityId = "123";
    const entityType = "entityType";

    it("should succeed when role has the permission", async function() {
      await permissionService.add({ name, roleId });
      const success = await permissionService.checkRole(roleId, name);
      expect(success).toBeTruthy();
    });

    it("should succeed when role has the permission with entity", async function() {
      await permissionService.add({ name, roleId, entityId, entityType });
      const success = await permissionService.checkRole(roleId, name, entityId, entityType);
      expect(success).toBeTruthy();
    });

    it("should succeed when role with entity has the permission", async function() {
      const newRoleId = await roleService
        .add({ name: "new role", parentId: roleId, entityId, entityType })
        .then(role => role.id);
      await permissionService.add({ name, roleId: newRoleId });
      const success = await permissionService.checkRole(newRoleId, name, entityId, entityType);
      expect(success).toBeTruthy();
    });

    it("should fail when role doesn't have the permission", async function() {
      const success = await permissionService.checkRole(roleId, name);
      expect(success).toBeFalsy();
    });

    it("should fail when role has the permission with wrong entity", async function() {
      await permissionService.add({ name, roleId, entityId: "other entity", entityType });
      const success = await permissionService.checkRole(roleId, name, entityId, entityType);
      expect(success).toBeFalsy();
    });

    it("should fail when role has the permission with entity but full access is required", async function() {
      await permissionService.add({ name, roleId, entityId, entityType });
      const success = await permissionService.checkRole(roleId, name);
      expect(success).toBeFalsy();
    });

    it("should fail when role has the permission but role has wrong entity", async function() {
      const newRoleId = await roleService
        .add({ name: "new role", parentId: roleId, entityId, entityType: "other type" })
        .then(role => role.id);
      await permissionService.add({ name, roleId: newRoleId });
      const success = await permissionService.checkRole(newRoleId, name, entityId, entityType);
      expect(success).toBeFalsy();
    });

    it("should fail when role has the permission but role has entity and full access is required", async function() {
      const newRoleId = await roleService
        .add({ name: "new role", parentId: roleId, entityId, entityType })
        .then(role => role.id);
      await permissionService.add({ name, roleId: newRoleId });
      const success = await permissionService.checkRole(newRoleId, name);
      expect(success).toBeFalsy();
    });
  });
});
