describe("auth", function() {
  describe("check permissions", function() {
    it("should succeed when user has single required permission", async function() {});

    it("should succeed when user has a role with single required permission", async function() {});

    it("should succeed when user has any of permissions with OR join", async function() {});

    it("should succeed when user has a role with any of permissions with OR join", async function() {});

    it("should succeed when user has all of permissions with AND join", async function() {});

    it("should succeed when user has a role with all of permissions with AND join", async function() {});

    it("should succeed when user has some and role has the rest of permissions with AND join", async function() {});

    it("should succeed when user has 2 roles both with some of permissions with AND join", async function() {});

    it("should fail when user doesn't have the required permission", async function() {});

    it("should fail when user doesn't have any of permissions with OR join", async function() {});

    it("should fail when user doesn't have any of permissions with AND join", async function() {});

    it("should fail when user doesn't have some of permissions with AND join", async function() {});
  });
});
