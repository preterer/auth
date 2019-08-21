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
});
