describe("Upload page access", () => {
  it("Redirects unauthenticated users to login page", () => {
    cy.visit("/upload");
    cy.url().should("include", "/login");
    cy.url().should("include", "from=%2Fupload");
  });
});

// describe("User VS Admin log in", () => {
//   it("Admin log in", () => {
//     cy.visit("/login");
//     cy.get("#email-d").type("fe9nton@gmail.com");
//     cy.get("#password-d").type("123");
//     cy.get("#submit-d").click();
//     cy.url().should("include", "/admin");
//   });
//   it.only("User log in", () => {
//     cy.visit("/login");
//     cy.get("#email-d").type("callemtobi@gmail.com");
//     cy.get("#password-d").type("123");
//     cy.get("#submit-d").click();
//     cy.url().should("include", "/home");
//   });
// });
