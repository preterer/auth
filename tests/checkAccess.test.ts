import { Container } from "typedi";

import { checkAccess } from "../src/checkAccess";
import { PermissionService } from "../src/services/permission.service";
import { RoleService } from "../src/services/role.service";
import { UserService } from "../src/services/user.service";

import { mockDB, mockData, clearData } from "./testUtils";

describe("checkAccess", function() {
  let permissionService: PermissionService,
    roleService: RoleService,
    userService: UserService,
    roleId: number,
    userId: number;

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
    await userService.roleAdd(userId, roleId);
  });

  afterEach(async function() {
    await clearData();
  });

  describe("authorized", function() {
    it("should succeed when no permissions are required", async function() {
      const hasAccess = await checkAccess({ id: userId }, []);
      expect(hasAccess).toBeTruthy();
    });

    it("should succeed when user has single required permission", async function() {
      const name = "1";
      await permissionService.add({ name, userId });
      const hasAccess = await checkAccess({ id: userId }, [name]);
      expect(hasAccess).toBeTruthy();
    });

    it("should succeed when user has any of permissions with OR join", async function() {
      const name = "1";
      await permissionService.add({ name, userId });
      const hasAccess = await checkAccess({ id: userId }, [name, "2", "3"], "OR");
      expect(hasAccess).toBeTruthy();
    });

    it("should succeed when user has all of permissions with AND join", async function() {
      const names = ["1", "2", "3"];
      await Promise.all(names.map(name => permissionService.add({ name, userId })));
      const hasAccess = await checkAccess({ id: userId }, names, "AND");
      expect(hasAccess).toBeTruthy();
    });

    it("should succeed when user has some and role has the rest of permissions with AND join", async function() {
      const names = ["1", "2", "3", "4"];
      await Promise.all(names.slice(0, 2).map(name => permissionService.add({ name, userId })));
      await Promise.all(names.slice(2, 4).map(name => permissionService.add({ name, roleId })));
      const hasAccess = await checkAccess({ id: userId }, names, "AND");
      expect(hasAccess).toBeTruthy();
    });

    it("should succeed when user has 2 roles both with some of permissions with AND join", async function() {
      const names = ["1", "2", "3", "4"];
      await userService.roleAdd(userId, roleId - 1);
      await Promise.all(names.slice(0, 2).map(name => permissionService.add({ name, roleId: roleId - 1 })));
      await Promise.all(names.slice(2, 4).map(name => permissionService.add({ name, roleId })));
      const hasAccess = await checkAccess({ id: userId }, names, "AND");
      expect(hasAccess).toBeTruthy();
    });

    it("should fail when user doesn't have the required permission", async function() {
      const hasAccess = await checkAccess({ id: userId }, ["whatever"]);
      expect(hasAccess).toBeFalsy();
    });

    it("should fail when user doesn't have any of permissions with OR join", async function() {
      const names = ["1", "2", "3", "4"];
      const hasAccess = await checkAccess({ id: userId }, names, "OR");
      expect(hasAccess).toBeFalsy();
    });

    it("should fail when user doesn't have any of permissions with AND join", async function() {
      const names = ["1", "2", "3", "4"];
      const hasAccess = await checkAccess({ id: userId }, names, "AND");
      expect(hasAccess).toBeFalsy();
    });

    it("should fail when user doesn't have some of permissions with AND join", async function() {
      const names = ["1", "2", "3", "4"];
      await Promise.all(names.slice(0, 3).map(name => permissionService.add({ name, userId })));
      const hasAccess = await checkAccess({ id: userId }, names, "AND");
      expect(hasAccess).toBeFalsy();
    });
  });

  describe("unauthorized", function() {
    it("should succeed when root role has single required permission", async function() {
      const roleId = await roleService.getRoot().then(role => role.id);
      const name = "1";
      await permissionService.add({ name, roleId });
      const hasAccess = await checkAccess(undefined, [name]);
      expect(hasAccess).toBeTruthy();
    });

    it("should succeed when root role has any of permissions with OR join", async function() {
      const roleId = await roleService.getRoot().then(role => role.id);
      const name = "1";
      await permissionService.add({ name, roleId });
      const hasAccess = await checkAccess(undefined, [name, "2", "3"], "OR");
      expect(hasAccess).toBeTruthy();
    });

    it("should succeed when root role has all of permissions with AND join", async function() {
      const roleId = await roleService.getRoot().then(role => role.id);
      const names = ["1", "2", "3"];
      await Promise.all(names.map(name => permissionService.add({ name, roleId })));
      const hasAccess = await checkAccess(undefined, names);
      expect(hasAccess).toBeTruthy();
    });

    it("should fail when no permissions are required", async function() {
      const hasAccess = await checkAccess(undefined, []);
      expect(hasAccess).toBeFalsy();
    });

    it("should fail when user doesn't have the required permission", async function() {
      const hasAccess = await checkAccess(undefined, ["1"]);
      expect(hasAccess).toBeFalsy();
    });

    it("should fail when user doesn't have any of permissions with OR join", async function() {
      const names = ["1", "2", "3"];
      const hasAccess = await checkAccess(undefined, names, "OR");
      expect(hasAccess).toBeFalsy();
    });

    it("should fail when user doesn't have any of permissions with AND join", async function() {
      const names = ["1", "2", "3"];
      const hasAccess = await checkAccess(undefined, names, "AND");
      expect(hasAccess).toBeFalsy();
    });

    it("should fail when user doesn't have some of permissions with AND join", async function() {
      const roleId = await roleService.getRoot().then(role => role.id);
      const names = ["1", "2", "3"];
      await Promise.all(names.slice(0, 2).map(name => permissionService.add({ name, roleId })));
      const hasAccess = await checkAccess(undefined, names);
      expect(hasAccess).toBeFalsy();
    });
  });
});
