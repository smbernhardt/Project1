


it('login test', function() {

    cy.visit('https://www.opencart.com')
    cy.get('.btn-link').click()
    cy.get('#input-email').type('bernhardt.shaun+1@gmail.com')
    cy.get('#input-password').type('#sarah12345')
    cy.get(':nth-child(1) > .hidden-xs').click()
    cy.wait(500)
    cy.get('#input-pin').type(1324)
    cy.get('form > :nth-child(2) > .btn').click()

    cy.get('#short-cut > :nth-child(2) > :nth-child(1)').click()
    cy.get('#input-company').type('some company')
    cy.get('.radio > :nth-child(1) > input').click()
    cy.get(':nth-child(4) > .btn-primary').click()




})


it('edit store info', function() {

    cy.visit('https://www.opencart.com')
    cy.get('.btn-link').click()
    cy.get('#input-email').type('bernhardt.shaun+1@gmail.com')
    cy.get('#input-password').type('#sarah12345')
    cy.get(':nth-child(1) > .hidden-xs').click()
    cy.wait(500)
    cy.get('#input-pin').type(1324)
    cy.get('form > :nth-child(2) > .btn').click()
    cy.get(':nth-child(9) > :nth-child(2) > .media > .media-body > .media-heading > a').click()
    cy.get(':nth-child(3) > :nth-child(1) > .form-group > .control-label')
        .should('have.text', 'First Name');
    cy.get('#input-firstname').clear().type('sarah')
    cy.get('#input-lastname').clear().type('lee')
    cy.get('#input-email').clear().type('bernhardt.shaun+1@gmail.com')
    cy.get(':nth-child(4) > :nth-child(1) > .form-group > .control-label')
        .should('have.text', 'E-Mail');
    cy.get('#input-telephone').clear().type(8483484343)
    cy.get('#input-payment-email').clear().type('bernhardt.shaun+1@gmail.com')
    cy.get('#input-address-1').clear().type('some address')
    cy.get('#input-city').clear().type('some city')
    cy.get('#input-country').select('United States')
    cy.get('#input-zone').select('California')
    cy.get('.text-right > .radio > :nth-child(1) > input').click()
    cy.get(':nth-child(5) > :nth-child(2) > .radio > :nth-child(1) > input').click()
    cy.get('#input-api-url').clear().type('http://api.bigfatapi.com')
    cy.get(':nth-child(6) > .btn-primary').click()
    cy.get(':nth-child(9) > :nth-child(2) > .media > .media-body > .media-heading > a').click()
    cy.get('#input-firstname')
        .should('have.text', '');
    cy.get('#input-lastname')
        .should('have.text', '');




})
