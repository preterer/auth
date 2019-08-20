import bcrypt from "bcrypt";
import * as TypeORM from "typeorm";

import { mockDB, mockData, userData } from "./testUtils";
import { UserRepository } from "../src/repositories/user.repository";

describe("User", function() {
  let userRepository: UserRepository, userId: number, roleId: number;

  beforeAll(async function() {
    await mockDB();
    userRepository = TypeORM.getCustomRepository(UserRepository);
  });

  beforeEach(async function() {
    const data = await mockData();
    userId = data.userId;
    roleId = data.roleId;
  });

  describe("hashPassword", function() {
    it("should has password on create", async function() {
      const newUserData = userData(userId + 1);
      const newUserId = await userRepository.saveModel(newUserData).then(user => user.id);
      const newUser = await userRepository.findOne(newUserId);
      expect(newUser.password).not.toBe(newUserData.password);
      const areMatching = await bcrypt.compare(newUserData.password, newUser.password);
      expect(areMatching).toBeTruthy();
    });

    it("should hash password on update", async function() {
      const newPassword = "newPassword";
      const user = await userRepository.findOne(userId);
      user.password = newPassword;
      await userRepository.saveModel(user);
      const updatedUser = await userRepository.findOne(userId);
      expect(updatedUser.password).not.toBe(newPassword);
      const areMatching = await bcrypt.compare(newPassword, updatedUser.password);
      expect(areMatching).toBeTruthy();
    });
  });

  describe("permissionAdd", function() {
    it("should add a new permission to user", async function() {
      const name = "PERMISSION";
      await userRepository.permissionAdd(userId, { name });
      const user = await userRepository.findOne(userId);
      const userPermissions = await user.permissions;
      expect(userPermissions.length).toBeGreaterThan(0);
      expect(!!userPermissions.find(permission => permission.name === name)).toBeTruthy();
    });

    it("should not add a permission to user that doesn't exist", async function() {
      const name = "PERMISSION";
      await expect(userRepository.permissionAdd(userId + 1, { name })).rejects.toThrow();
    });
  });

  describe("permissionRemove", function() {
    it("should remove a permission which was previously assigned to user", function() {});

    it("should not remove a permission which was not assigned to user", function() {});
  });

  describe("roleAdd", function() {
    it("should assign a role to user", function() {});

    it("should not assign a role to user that doesn't exist", function() {});

    it("should not assign a role that doesn't exist", function() {});
  });

  describe("roleRemove", function() {
    it("should unassign a role from user", function() {});

    it("should not unassign a role from user that doesn't exist", function() {});

    it("should not assign a role which is not previously assigned", function() {});
  });

  describe("filter", function() {
    it("should find an user with login matching search", function() {});

    it("should not find user with login that doesn't match search", function() {});
  });
});
