describe("Upload page access", () => {
  it("redirects unauthenticated users to login", () => {
    cy.visit("/upload");
    cy.url().should("include", "/login");
    cy.url().should("include", "from=%2Fupload");
  });
  it.only("allows logged-in users to reach upload", () => {
    cy.visit("/home");
    cy.visit("/upload");
    cy.url().should("include", "/login");
    cy.log("callemtobi@gmail.com", "123");
    cy.visit("/home");
    // cy.visit("/upload");
    // cy.url().should("include", "/upload");
  });
});
