describe('Sweetshop.com Assertion Helpers', () => {
    beforeEach(() => {
        cy.visit('https://sweetshop.com')
        cy.get('#accept-cookies').click()
    })

    // Custom commands for common assertions
    Cypress.Commands.add('shouldHavePrice', { prevSubject: true }, (subject, expectedPrice) => {
        cy.wrap(subject)
            .find('.price')
            .invoke('text')
            .then((text) => {
                const price = parseFloat(text.replace('$', ''))
                expect(price).to.equal(expectedPrice)
            })
    })

    Cypress.Commands.add('shouldBeInStock', { prevSubject: true }, (subject) => {
        cy.wrap(subject)
            .find('.stock-status')
            .should('contain', 'In Stock')
            .and('have.class', 'available')
    })

    it('should validate product card structure', () => {
        cy.get('.product-card').first().within(() => {
            // Visual structure assertions
            cy.get('.product-image')
                .should('be.visible')
                .and('have.prop', 'naturalWidth').should('be.gt', 0)

            cy.get('.product-title')
                .should('not.be.empty')
                .and('have.css', 'font-weight', '700')

            cy.get('.product-price')
                .invoke('text')
                .should('match', /^\$\d+\.\d{2}$/)

            // Nested elements check
            cy.get('.rating-stars')
                .children()
                .should('have.length', 5)
        })
    })

    it('should verify numeric calculations', () => {
        // Add items to cart
        cy.get('.product-card').first().within(() => {
            cy.get('.price').invoke('text').then((price) => {
                const basePrice = parseFloat(price.replace('$', ''))
                cy.get('.quantity-input').clear().type('2')
                cy.get('.add-to-cart').click()
                
                // Verify subtotal calculation
                cy.get('#cart-subtotal')
                    .invoke('text')
                    .then((subtotal) => {
                        const calculatedTotal = parseFloat(subtotal.replace('$', ''))
                        expect(calculatedTotal).to.equal(basePrice * 2)
                    })
            })
        })
    })

    it('should validate form error states', () => {
        const errorStates = {
            empty: {
                message: 'This field is required',
                class: 'error-empty'
            },
            invalid: {
                message: 'Please enter a valid value',
                class: 'error-invalid'
            },
            tooLong: {
                message: 'Maximum length exceeded',
                class: 'error-length'
            }
        }

        cy.get('#contact-form').within(() => {
            // Test empty validation
            cy.get('#name').focus().blur()
            cy.get('.error-message')
                .should('contain', errorStates.empty.message)
            cy.get('#name')
                .should('have.class', errorStates.empty.class)

            // Test invalid email
            cy.get('#email').type('invalid-email')
            cy.get('.error-message')
                .should('contain', errorStates.invalid.message)
            cy.get('#email')
                .should('have.class', errorStates.invalid.class)
        })
    })

    it('should verify sorting and filtering results', () => {
        // Sort by price
        cy.get('#sort-select').select('price-low-high')
        
        // Verify price order
        cy.get('.product-price').then($prices => {
            const prices = [...$prices].map(el => 
                parseFloat(el.innerText.replace('$', '')))
            
            // Custom assertion for sorted array
            expect(prices).to.deep.equal([...prices].sort((a, b) => a - b))
        })

        // Apply price filter
        cy.get('#price-min').type('10')
        cy.get('#price-max').type('50')
        cy.get('#apply-filter').click()

        // Verify filtered results
        cy.get('.product-price').each($price => {
            const price = parseFloat($price.text().replace('$', ''))
            expect(price).to.be.within(10, 50)
        })
    })

    it('should validate responsive layout', () => {
        // Test different viewport sizes
        const viewports = ['iphone-6', 'ipad-2', [1920, 1080]]
        
        viewports.forEach(size => {
            cy.viewport(size)
            
            // Verify responsive elements
            cy.get('#header').should($header => {
                if (Cypress.config('viewportWidth') < 768) {
                    expect($header).to.have.class('mobile-header')
                } else {
                    expect($header).to.have.class('desktop-header')
                }
            })
        })
    })

    it('should verify state persistence', () => {
        // Set up initial state
        const testState = {
            cartItems: 2,
            wishlistItems: 1,
            compareItems: 3
        }

        // Add items to various lists
        cy.get('.product-card').first()
            .find('.add-to-cart').click()
            .then(() => {
                // Reload page
                cy.reload()
                
                // Verify persisted state
                cy.get('#cart-count')
                    .should('contain', testState.cartItems)
                cy.get('#wishlist-count')
                    .should('contain', testState.wishlistItems)
                cy.get('#compare-count')
                    .should('contain', testState.compareItems)
            })
    })

    it('should validate dynamic content updates', () => {
        // Watch for DOM changes
        cy.get('.product-grid').then($grid => {
            const initialCount = $grid.children().length
            
            // Trigger load more
            cy.get('#load-more').click()
            
            // Verify new items added
            cy.get('.product-grid')
                .children()
                .should('have.length.gt', initialCount)
                .and('be.visible')
        })
    })

    it('should verify accessibility attributes', () => {
        // Custom command for a11y checks
        const a11yChecks = ($el) => {
            expect($el).to.have.attr('role')
            expect($el).to.have.attr('aria-label')
            if ($el.is('button')) {
                expect($el).to.have.attr('aria-pressed')
            }
            if ($el.is('[role="dialog"]')) {
                expect($el).to.have.attr('aria-modal', 'true')
            }
        }

        // Check interactive elements
        cy.get('button').each($button => a11yChecks($button))
        cy.get('[role="dialog"]').each($dialog => a11yChecks($dialog))
    })
})
