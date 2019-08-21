import bcrypt from "bcrypt";
import { Container } from "typedi";

import { PermissionFilters } from "../src/interfaces/filters/permission.filters";
import { PermissionService } from "../src/services/permission.service";
import { User } from "../src/entities/user.entity";
import { UserService } from "../src/services/user.service";

import { mockDB, mockData, userData, clearData } from "./testUtils";

describe("User", function() {
  let permissionService: PermissionService, userService: UserService, userId: number, roleId: number, amounts: number;

  beforeAll(async function() {
    await mockDB();
    userService = Container.get(UserService);
    permissionService = Container.get(PermissionService);
  });

  beforeEach(async function() {
    const data = await mockData();
    userId = data.userId;
    roleId = data.roleId;
    amounts = data.amounts;
  });

  afterEach(async function() {
    await clearData();
  });

  describe("get", function() {
    it("should get an user", async function() {
      const user = await userService.get(userId);
      expect(user).not.toBeUndefined();
      expect(user instanceof User).toBeTruthy();
    });

    it("should not get a non existing user", async function() {
      await expect(userService.get(userId + 1)).rejects.toThrow();
    });
  });

  describe("list", function() {
    it("should find all users", async function() {
      const results = await userService.list();
      expect(results.list.length).toEqual(amounts);
      expect(results.count).toEqual(amounts);
    });

    it("should find an user with login matching search", async function() {
      const user = await userService.get(userId);
      const searches = [
        user.login,
        user.login.slice(0, 4),
        user.login.slice(4, 8),
        user.login.slice(user.login.length - 4, user.login.length - 1)
      ];
      for (const search of searches) {
        const results = await userService.list({ search });
        expect(results.list.length).toBeGreaterThan(0);
        expect(results.count).toBeGreaterThan(0);
      }
    });

    it("should not find user with login that doesn't match search", async function() {
      const results = await userService.list({ search: "8a89eseaej9a8sjeaskle" });
      expect(results.list.length).toBe(0);
      expect(results.count).toBe(0);
    });
  });

  describe("add", function() {
    it("should add a new user", async function() {
      const user = await userService.add({ login: "test", password: "test" });
      expect(user).not.toBeUndefined();
      expect(await userService.get(user.id)).not.toBeUndefined();
    });
  });

  describe("update", function() {
    it("should update user", async function() {
      const login = "test12345";
      await userService.update(userId, { login });
      const user = await userService.get(userId);
      expect(user.login).toBe(login);
    });

    it("should not update a non existing user", async function() {
      const login = "test12345";
      await expect(userService.update(userId + 1, { login })).rejects.toThrow();
    });
  });

  describe("delete", function() {
    it("should delete an user", async function() {
      await userService.delete(userId);
      await expect(userService.get(userId)).rejects.toThrow();
    });

    it("should not delete a non existing user", async function() {
      await expect(userService.delete(userId + 1)).rejects.toThrow();
    });

    it("should delete permissions with role", async function() {
      await permissionService.add({ name: "test", userId });
      await userService.delete(userId);
      const permissions = await permissionService.list({ userId } as PermissionFilters);
      expect(permissions.count).toBe(0);
    });
  });

  describe("hashPassword", function() {
    it("should has password on create", async function() {
      const newUserData = userData(userId + 1);
      const newUserId = await userService.add(newUserData).then(user => user.id);
      const newUser = await userService.get(newUserId);
      expect(newUser.password).not.toBe(newUserData.password);
      const areMatching = await bcrypt.compare(newUserData.password, newUser.password);
      expect(areMatching).toBeTruthy();
    });

    it("should hash password on update", async function() {
      const newPassword = "newPassword";
      const user = await userService.get(userId);
      user.password = newPassword;
      await userService.update(user.id, user);
      const updatedUser = await userService.get(userId);
      expect(updatedUser.password).not.toBe(newPassword);
      const areMatching = await bcrypt.compare(newPassword, updatedUser.password);
      expect(areMatching).toBeTruthy();
    });
  });

  describe("roleAdd", function() {
    it("should assign a role to user", async function() {
      await userService.roleAdd(userId, roleId);
      const roles = await userService.get(userId).then(user => user.roles);
      expect(roles.length).toBeGreaterThan(0);
      expect(roles.some(role => role.id === roleId)).toBeTruthy();
    });

    it("should not assign a role to user that doesn't exist", async function() {
      await expect(userService.roleAdd(userId + 1, roleId)).rejects.toThrow();
    });

    it("should not assign a role that doesn't exist", async function() {
      await expect(userService.roleAdd(userId, roleId + 1)).rejects.toThrow();
    });
  });

  describe("roleRemove", function() {
    it("should unassign a role from user", async function() {
      await userService.roleAdd(userId, roleId);
      await userService.roleRemove(userId, roleId);
      const roles = await userService.get(userId).then(user => user.roles);
      expect(roles.some(role => role.id === roleId)).toBeFalsy();
    });

    it("should not unassign a role from user that doesn't exist", async function() {
      await expect(userService.roleRemove(userId + 1, roleId)).rejects.toThrow();
    });

    it("should not assign a role which is not previously assigned", async function() {
      await expect(userService.roleRemove(userId, roleId)).rejects.toThrow();
    });
  });

  describe("login", function() {
    it("should login an user", async function() {
      const loginData = userData(1);
      const result = await userService.login(loginData);
      expect(result).not.toBeUndefined();
    });

    it("should fail to login when user provides an incorrect password", async function() {
      const loginData = userData(1);
      loginData.password = "incorrect password";
      await expect(userService.login(loginData)).rejects.toThrow();
    });

    it("should fail to login when user provides login of non existing user", async function() {
      const loginData = userData(1);
      loginData.login = "incorrect login";
      await expect(userService.login(loginData)).rejects.toThrow();
    });
  });
});
