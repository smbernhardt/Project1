describe('Sweetshop.com Tests', () => {
    beforeEach(() => {
        cy.visit('https://sweetshop.com')
        // Assuming we need to accept cookies and set up initial state
        cy.get('#accept-cookies').click()
        // Clear cart if exists
        cy.get('#cart-icon').click()
        cy.get('#clear-cart').click()
    })

    it('should search for candy products', () => {
        cy.get('#search-input').type('chocolate{enter}')
        cy.get('.product-grid')
            .should('be.visible')
            .and('contain', 'chocolate')
        cy.get('.product-count')
            .should('have.length.gt', 0)
    })

    it('should add items to cart and verify total', () => {
        // Add first product to cart
        cy.get('.product-card').first()
            .find('.product-price').invoke('text')
            .then((price) => {
                const itemPrice = parseFloat(price.replace('$', ''))
                cy.get('.product-card').first()
                    .find('.add-to-cart').click()
                
                // Verify cart total
                cy.get('#cart-total')
                    .should('contain', `$${itemPrice.toFixed(2)}`)
            })
        
        // Verify cart count
        cy.get('#cart-count')
            .should('contain', '1')
    })

    it('should complete checkout process', () => {
        // Add item to cart first
        cy.get('.product-card').first()
            .find('.add-to-cart').click()
        
        // Start checkout
        cy.get('#checkout-button').click()
        
        // Fill shipping info
        cy.get('#shipping-form').within(() => {
            cy.get('#first-name').type('John')
            cy.get('#last-name').type('Doe')
            cy.get('#email').type('john@example.com')
            cy.get('#address').type('123 Sweet Street')
            cy.get('#city').type('Candyville')
            cy.get('#zip').type('12345')
            cy.get('#phone').type('1234567890')
        })
        
        cy.get('#continue-to-payment').click()
        
        // Verify on payment page
        cy.url().should('include', '/payment')
    })

    it('should filter products by category', () => {
        cy.get('#category-filter').click()
        cy.get('.category-list')
            .contains('Gummy Bears')
            .click()
        
        cy.get('.product-grid')
            .should('contain', 'Gummy')
        cy.get('.active-filter')
            .should('contain', 'Gummy Bears')
    })

    it('should sort products by price', () => {
        cy.get('#sort-select').select('price-low-high')
        
        // Get all prices and verify they're in ascending order
        cy.get('.product-price').then($prices => {
            const prices = [...$prices].map(el => 
                parseFloat(el.innerText.replace('$', '')))
            const sortedPrices = [...prices].sort((a, b) => a - b)
            expect(prices).to.deep.equal(sortedPrices)
        })
    })
})
