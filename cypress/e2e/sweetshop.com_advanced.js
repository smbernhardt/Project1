describe('Sweetshop.com Advanced Tests', () => {
    beforeEach(() => {
        cy.visit('https://sweetshop.com')
        cy.get('#accept-cookies').click()
        cy.get('#cart-icon').click()
        cy.get('#clear-cart').click()
    })

    it('should handle bulk purchases with quantity limits', () => {
        // Get first product with stock information
        cy.get('.product-card').first().within(() => {
            cy.get('.stock-count').invoke('text').then((stock) => {
                const maxStock = parseInt(stock)
                // Try to add more than available
                cy.get('.quantity-input').clear().type(maxStock + 1)
                cy.get('.add-to-cart').click()
                // Verify error message
                cy.get('.error-message')
                    .should('be.visible')
                    .and('contain', 'Exceeds available stock')
                
                // Add maximum allowed quantity
                cy.get('.quantity-input').clear().type(maxStock)
                cy.get('.add-to-cart').click()
                // Verify cart total and quantity
                cy.get('#cart-count').should('contain', maxStock)
            })
        })
    })

    it('should apply and validate promotional codes', () => {
        // Add items to reach minimum spend threshold
        cy.get('.product-card').first().find('.add-to-cart').click()
        cy.get('#cart-icon').click()

        // Test invalid promo code
        cy.get('#promo-code').type('INVALID123')
        cy.get('#apply-promo').click()
        cy.get('.promo-error')
            .should('be.visible')
            .and('contain', 'Invalid code')

        // Test valid promo code
        cy.get('#promo-code').clear().type('SWEET10')
        cy.get('#apply-promo').click()
        
        // Verify discount calculation
        cy.get('#subtotal').invoke('text').then((subtotal) => {
            const originalPrice = parseFloat(subtotal.replace('$', ''))
            const expectedDiscount = originalPrice * 0.10
            cy.get('#discount-amount')
                .should('contain', `$${expectedDiscount.toFixed(2)}`)
        })
    })

    it('should handle address validation and shipping options', () => {
        cy.get('.product-card').first().find('.add-to-cart').click()
        cy.get('#checkout-button').click()

        // Test invalid zip code
        cy.get('#shipping-form').within(() => {
            cy.get('#first-name').type('John')
            cy.get('#last-name').type('Doe')
            cy.get('#email').type('john@example.com')
            cy.get('#address').type('123 Sweet Street')
            cy.get('#city').type('Candyville')
            cy.get('#zip').type('00000')
        })

        cy.get('#validate-address').click()
        cy.get('.address-error')
            .should('contain', 'Invalid zip code')

        // Test shipping options availability
        cy.get('#zip').clear().type('12345')
        cy.get('#validate-address').click()
        
        // Verify shipping options and prices
        cy.get('#shipping-options').within(() => {
            cy.get('.standard-shipping')
                .should('exist')
                .and('contain', '$')
            cy.get('.express-shipping')
                .should('exist')
                .and('contain', '$')
        })
    })

    it('should persist cart across sessions', () => {
        // Add items to cart
        cy.get('.product-card').first().find('.add-to-cart').click()
        
        // Get cart state
        cy.get('#cart-count').invoke('text').then((count) => {
            const itemCount = count
            
            // Simulate session refresh
            cy.reload()
            
            // Verify cart persisted
            cy.get('#cart-count')
                .should('have.text', itemCount)
        })
    })

    it('should handle real-time stock updates', () => {
        // Monitor first product's stock
        cy.get('.product-card').first().within(() => {
            cy.get('.stock-count').invoke('text').then((initialStock) => {
                const stock = parseInt(initialStock)
                
                // Add all available items to cart
                for(let i = 0; i < stock; i++) {
                    cy.get('.add-to-cart').click()
                    cy.wait(500) // Wait for stock update
                }
                
                // Verify out of stock status
                cy.get('.stock-status')
                    .should('contain', 'Out of Stock')
                cy.get('.add-to-cart')
                    .should('be.disabled')
            })
        })
    })

    it('should handle multiple currency conversions', () => {
        // Get price in default currency
        cy.get('.product-card').first()
            .find('.product-price')
            .invoke('text')
            .then((usdPrice) => {
                const originalPrice = parseFloat(usdPrice.replace('$', ''))

                // Change currency to EUR
                cy.get('#currency-selector').select('EUR')
                
                // Verify price conversion
                cy.get('.product-card').first()
                    .find('.product-price')
                    .invoke('text')
                    .should((eurPrice) => {
                        const convertedPrice = parseFloat(eurPrice.replace('€', ''))
                        // Assuming rough conversion rate of 1 USD = 0.85 EUR
                        expect(convertedPrice).to.be.closeTo(originalPrice * 0.85, 0.1)
                    })
            })
    })
})
