import jwt from "jsonwebtoken";
import { Container } from "typedi";

import { AuthConfig } from "../src/config";
import { authMiddleware } from "../src/middleware";
import { useAuthStrategy } from "../src/strategy";

import { mockDB, mockData } from "./testUtils";

describe("middleware", function() {
  let config: AuthConfig, userId: number;

  beforeAll(async function() {
    await mockDB();
    config = Container.get(AuthConfig);
    const data = await mockData();
    userId = data.userId;
  });

  it("should add user to req", async function() {
    useAuthStrategy();
    const token = jwt.sign({ id: userId }, config.jwtSecret);

    const req: any = {
      header: _ => `Bearer ${token}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    await new Promise((resolve, _) => authMiddleware()(req, {} as any, () => resolve()));
    expect(req.user).not.toBeUndefined();
  });

  it("should not add user to req when token has id of undefined user", async function() {
    useAuthStrategy();
    const token = jwt.sign({ id: userId + 1 }, config.jwtSecret);

    const req: any = {
      header: _ => `Bearer ${token}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    await new Promise((resolve, _) => authMiddleware()(req, {} as any, () => resolve()));
    expect(req.user).toBeUndefined();
  });

  it("should not add user to req when token is not provided", async function() {
    const req: any = {
      header: _ => _,
      headers: {}
    };
    await new Promise((resolve, _) => authMiddleware()(req, {} as any, () => resolve()));
    expect(req.user).toBeUndefined();
  });
});
