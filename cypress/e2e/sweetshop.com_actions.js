describe('Sweetshop.com Actions', () => {
    let testData;

    before(() => {
        cy.fixture('data_fixture.json').then((data) => {
            testData = data;
        });
    });

    it('should handle user login', () => {
        const user = testData.testUsers.standard;
        cy.get('#login-form').within(() => {
            cy.get('#email').type(user.email)
            cy.get('#password').type(user.password)
            cy.get('button[type="submit"]').click()
        })
    })
}) 