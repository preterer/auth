import Container from "typedi";

import { PermissionFilters } from "../src/interfaces/filters/permission.filters";
import { PermissionService } from "../src/services/permission.service";
import { RoleService } from "../src/services/role.service";

import { mockDB, mockData, clearData } from "./testUtils";

describe("Role", function() {
  let permissionService: PermissionService, roleService: RoleService, roleId: number, amounts: number;

  beforeAll(async function() {
    await mockDB();
    roleService = Container.get(RoleService);
    permissionService = Container.get(PermissionService);
  });

  beforeEach(async function() {
    const data = await mockData();
    roleId = data.roleId;
    amounts = data.amounts;
  });

  afterEach(async function() {
    await clearData();
  });

  describe("list", function() {
    it("should find a role", async function() {
      const role = await roleService.get(roleId);
      const searches = [
        role.name,
        role.name.slice(0, 4),
        role.name.slice(4, 8),
        role.name.slice(role.name.length - 4, role.name.length - 1)
      ];
      for (const search of searches) {
        const results = await roleService.list({ search });
        expect(results.list.length).toBeGreaterThan(0);
        expect(results.count).toBeGreaterThan(0);
      }
    });

    it("should not find role with name that doesn't match search", async function() {
      const results = await roleService.list({ search: "8a89eseaej9a8sjeaskle" });
      expect(results.list.length).toBe(0);
      expect(results.count).toBe(0);
    });

    it("should get all roles", async function() {
      const results = await roleService.list();
      expect(results.list.length).toEqual(amounts + 1); // + root role
      expect(results.count).toEqual(amounts + 1); // + root role
    });
  });

  describe("getRoot", function() {
    it("should find the root role", async function() {
      const rootRole = await roleService.getRoot();
      expect(rootRole).not.toBeUndefined();
      const parent = await rootRole.parent;
      expect(parent).toBeUndefined();
    });
  });

  describe("add", function() {
    it("should allow to add a role with parent", async function() {
      const newRole = await roleService.add({ name: "Test", parentId: roleId });
      expect(newRole).not.toBeUndefined();
      const newRoleFromDb = await roleService.get(newRole.id);
      const parent = await newRoleFromDb.parent;
      expect(parent).not.toBeUndefined();
      expect(parent.id).toBe(roleId);
    });

    it("should not allow to add a role with parent that doesn't exist", async function() {
      await expect(roleService.add({ name: "Test", parentId: roleId + 1 })).rejects.toThrow();
    });

    it("should not allow to add a role without parent", async function() {
      await expect(roleService.add({ name: "Test", parentId: undefined })).rejects.toThrow();
    });
  });

  describe("update", function() {
    it("should not allow to set parent to root role", async function() {
      const rootRole = await roleService.getRoot();
      await expect(roleService.update(rootRole.id, { name: rootRole.name, parentId: roleId })).rejects.toThrow();
    });

    it("should allow to move a regular role through the tree", async function() {
      const parentId = roleId - 1;
      await roleService.update(roleId, { name: "test", parentId });
      const role = await roleService.get(roleId);
      const parent = await role.parent;
      expect(parent.id).toBe(parentId);
    });

    it("should not allow to set role as its parent", async function() {
      await expect(roleService.update(roleId, { name: "test", parentId: roleId })).rejects.toThrow();
    });

    it("should allow to only update name of a role", async function() {
      const name = "New test name";
      const roleBeforeUpdate = await roleService.get(roleId);
      const parentBeforeUpdate = await roleBeforeUpdate.parent;
      await roleService.update(roleId, { name });
      const roleAfterUpdate = await roleService.get(roleId);
      const parentAfterUpdate = await roleAfterUpdate.parent;
      expect(roleAfterUpdate.name).toBe(name);
      expect(parentAfterUpdate.id).toBe(parentBeforeUpdate.id);
    });
  });

  describe("delete", function() {
    it("should not allow to remove a role without parent that doesn't exist", async function() {
      const rootRole = await roleService.getRoot();
      await expect(roleService.delete(rootRole.id)).rejects.toThrow();
    });

    it("should allow to delete a regular role", async function() {
      await roleService.delete(roleId);
      await expect(roleService.get(roleId)).rejects.toThrow();
    });

    it("should delete permissions with role", async function() {
      await permissionService.add({ name: "test", roleId });
      await roleService.delete(roleId);
      const permissions = await permissionService.list({ roleId } as PermissionFilters);
      expect(permissions.count).toBe(0);
    });
  });

  describe("copy permissions", function() {
    it("should copy permissions from parent role to child role", async function() {
      const permissionNames = ["1", "2", "3", "4"];
      await Promise.all(permissionNames.map(name => permissionService.add({ name, roleId })));
      await roleService.copyPermissions(roleId, roleId - 1);
      const permissions = await permissionService.list({ roleId: roleId - 1 } as PermissionFilters);
      expect(permissions.count).toBe(permissionNames.length);
      for (const name of permissionNames) {
        expect(permissions.list.some(permission => permission.name === name)).toBeTruthy();
      }
    });
  });

  describe("remove inherited permissions", function() {
    it("should remove permissions inherited from other roles", async function() {
      const permissionNames = ["1", "2", "3", "4"];
      await Promise.all(permissionNames.map(name => permissionService.add({ name, roleId })));
      await roleService.copyPermissions(roleId, roleId - 1);
      await roleService.removeInheritedPermissions(roleId - 1);
      const permissions = await permissionService.list({ roleId: roleId - 1 } as PermissionFilters);
      expect(permissions.count).toBe(0);
    });
  });
});
