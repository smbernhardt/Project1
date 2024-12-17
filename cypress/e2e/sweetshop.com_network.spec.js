describe('Sweetshop.com Network Tests', () => {
    beforeEach(() => {
        cy.visit('https://sweetshop.com')
        cy.get('#accept-cookies').click()
    })

    it('should intercept and validate product API calls', () => {
        // Intercept product listing API
        cy.intercept('GET', '/api/products*').as('productList')
        cy.intercept('GET', '/api/products/*').as('productDetail')

        // Visit products page
        cy.get('#products-link').click()
        
        // Validate product list response
        cy.wait('@productList').then((interception) => {
            expect(interception.response.statusCode).to.eq(200)
            expect(interception.response.body).to.have.property('products')
            expect(interception.response.body.products).to.be.an('array')
        })

        // Click first product and validate detail API
        cy.get('.product-card').first().click()
        cy.wait('@productDetail').then((interception) => {
            expect(interception.response.statusCode).to.eq(200)
            expect(interception.response.body).to.have.property('id')
            expect(interception.response.body).to.have.property('price')
            expect(interception.response.body).to.have.property('stock')
        })
    })

    it('should handle failed API responses', () => {
        // Simulate 500 error for product list
        cy.intercept('GET', '/api/products*', {
            statusCode: 500,
            body: { error: 'Internal Server Error' }
        }).as('failedRequest')

        cy.get('#products-link').click()
        
        // Verify error handling UI
        cy.get('.error-message')
            .should('be.visible')
            .and('contain', 'Unable to load products')
        
        // Verify retry mechanism
        cy.get('#retry-button')
            .should('be.visible')
            .click()
    })

    it('should validate cart operations with API', () => {
        // Intercept cart operations
        cy.intercept('POST', '/api/cart/add').as('addToCart')
        cy.intercept('GET', '/api/cart').as('getCart')
        cy.intercept('DELETE', '/api/cart/*').as('removeItem')

        // Add item to cart
        cy.get('.product-card').first().find('.add-to-cart').click()
        
        // Validate add to cart request
        cy.wait('@addToCart').then((interception) => {
            expect(interception.request.body).to.have.property('productId')
            expect(interception.request.body).to.have.property('quantity')
            expect(interception.response.statusCode).to.eq(200)
        })

        // Validate cart fetch
        cy.wait('@getCart').then((interception) => {
            expect(interception.response.body).to.have.property('items')
            expect(interception.response.body.items).to.be.an('array')
            expect(interception.response.body).to.have.property('total')
        })
    })

    it('should test search API with debouncing', () => {
        // Intercept search API
        cy.intercept('GET', '/api/search*').as('searchRequest')

        // Type slowly to test debouncing
        cy.get('#search-input')
            .type('choc', { delay: 100 })

        // Wait for debounced API call
        cy.wait('@searchRequest').then((interception) => {
            expect(interception.request.url).to.include('q=choc')
            expect(interception.response.statusCode).to.eq(200)
            expect(interception.response.body.results).to.be.an('array')
        })
    })

    it('should validate checkout API flow', () => {
        // Intercept checkout APIs
        cy.intercept('POST', '/api/checkout/validate').as('validateCheckout')
        cy.intercept('POST', '/api/checkout/shipping').as('shippingCalc')
        cy.intercept('POST', '/api/checkout/payment').as('payment')

        // Add item and go to checkout
        cy.get('.product-card').first().find('.add-to-cart').click()
        cy.get('#checkout-button').click()

        // Fill shipping info
        cy.get('#shipping-form').within(() => {
            cy.get('#first-name').type('John')
            cy.get('#last-name').type('Doe')
            cy.get('#email').type('john@example.com')
            cy.get('#address').type('123 Sweet Street')
            cy.get('#city').type('Candyville')
            cy.get('#zip').type('12345')
        })

        // Validate address validation request
        cy.get('#validate-address').click()
        cy.wait('@validateCheckout').then((interception) => {
            expect(interception.request.body).to.have.property('address')
            expect(interception.response.statusCode).to.eq(200)
            expect(interception.response.body.valid).to.be.true
        })

        // Validate shipping calculation
        cy.wait('@shippingCalc').then((interception) => {
            expect(interception.response.body).to.have.property('options')
            expect(interception.response.body.options).to.be.an('array')
        })
    })

    it('should test API rate limiting', () => {
        // Intercept rate-limited API
        cy.intercept('GET', '/api/products/featured*').as('featuredProducts')

        // Make multiple rapid requests
        for(let i = 0; i < 5; i++) {
            cy.get('#featured-refresh').click()
        }

        // Verify rate limit response
        cy.wait('@featuredProducts').then((interception) => {
            if(interception.response.statusCode === 429) {
                expect(interception.response.body)
                    .to.have.property('message')
                    .and.include('rate limit')
                
                // Verify retry-after header
                expect(interception.response.headers)
                    .to.have.property('retry-after')
            }
        })
    })
})
