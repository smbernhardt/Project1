describe('Sweetshop.com Assertions', () => {
    let testData;

    before(() => {
        cy.fixture('data_fixture.json').then((data) => {
            testData = data;
        });
    });

    it('should verify product data', () => {
        testData.products.featured.forEach(product => {
            cy.get(`.product-card[data-product-id="${product.id}"]`)
                .within(() => {
                    cy.get('.product-name').should('contain', product.name)
                    cy.get('.product-price').should('contain', product.price)
                    cy.get('.product-category').should('contain', product.category)
                })
        })
    })
}) 