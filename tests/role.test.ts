import { RoleService } from "../src/services/role.service";
import { mockDB, mockData, clearData } from "./testUtils";
import Container from "typedi";

describe("Role", function() {
  let roleService: RoleService, roleId: number, amounts: number;

  beforeAll(async function() {
    await mockDB();
    roleService = Container.get(RoleService);
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

  describe("delete", function() {
    it("should not allow to remove a role without parent that doesn't exist", async function() {
      const rootRole = await roleService.getRoot();
      await expect(roleService.delete(rootRole.id)).rejects.toThrow();
    });

    it("should allow to delete a regular role", async function() {
      await roleService.delete(roleId);
      await expect(roleService.get(roleId)).rejects.toThrow();
    });
  });
});
