/// <reference types="Cypress" />

describe('My First Test', function () {
  it('Visits LibMol.org', function () {
    cy.visit('http://localhost:8080')
    cy.contains('Commandes').click()
  })
})
