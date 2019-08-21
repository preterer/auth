import { Container } from "typedi";

import { PermissionFilters } from "../src/interfaces/filters/permission.filters";
import { PermissionService } from "../src/services/permission.service";

import { mockDB, mockData, clearData } from "./testUtils";

describe("Permission", function() {
  let permissionService: PermissionService, userId: number, roleId: number;

  beforeAll(async function() {
    await mockDB();
    permissionService = Container.get(PermissionService);
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
});
