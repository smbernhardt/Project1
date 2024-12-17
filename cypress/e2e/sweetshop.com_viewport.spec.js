describe('Sweetshop.com Viewport Tests', () => {
    const viewports = {
        mobile: {
            width: 375,
            height: 667,
            device: 'iPhone 8'
        },
        tablet: {
            width: 768,
            height: 1024,
            device: 'iPad Mini'
        },
        desktop: {
            width: 1920,
            height: 1080,
            device: 'Desktop'
        }
    }

    const viewportWaits = {
        waitForResize: () => {
            return new Cypress.Promise(resolve => {
                let resizeTimeout
                cy.window().then(win => {
                    win.addEventListener('resize', () => {
                        clearTimeout(resizeTimeout)
                        resizeTimeout = setTimeout(resolve, 100)
                    })
                })
            })
        },

        waitForMediaQuery: (query) => {
            cy.window().then(win => {
                return new Cypress.Promise(resolve => {
                    const mql = win.matchMedia(query)
                    if (mql.matches) {
                        resolve()
                    } else {
                        mql.addEventListener('change', resolve, { once: true })
                    }
                })
            })
        }
    }

    beforeEach(() => {
        cy.visit('https://sweetshop.com')
        cy.get('#accept-cookies').click()
    })

    Object.entries(viewports).forEach(([device, dimensions]) => {
        describe(`${device.toUpperCase()} View Tests`, () => {
            beforeEach(() => {
                cy.viewport(dimensions.width, dimensions.height)
            })

            it(`should display correct navigation for ${device}`, () => {
                if (device === 'mobile') {
                    // Mobile hamburger menu
                    cy.get('#mobile-menu-toggle')
                        .should('be.visible')
                        .click()
                    
                    cy.get('.mobile-nav')
                        .should('be.visible')
                        .find('.nav-item')
                        .should('have.length.gt', 0)
                } else {
                    // Desktop/tablet navigation
                    cy.get('#main-nav')
                        .should('be.visible')
                        .find('.nav-item')
                        .should('have.length.gt', 0)
                }
            })

            it(`should adjust product grid for ${device}`, () => {
                cy.get('.product-grid').then($grid => {
                    const productCards = $grid.find('.product-card')
                    
                    switch(device) {
                        case 'mobile':
                            expect(productCards).to.have.css('width', '100%')
                            break
                        case 'tablet':
                            expect(productCards).to.have.css('width', '50%')
                            break
                        case 'desktop':
                            expect(productCards).to.have.css('width', '25%')
                            break
                    }
                })
            })

            it(`should handle search functionality on ${device}`, () => {
                if (device === 'mobile') {
                    cy.get('#search-toggle').click()
                    cy.get('#search-overlay')
                        .should('be.visible')
                } 
                
                cy.get('#search-input')
                    .should('be.visible')
                    .type('chocolate{enter}')
                
                // Verify search results layout
                cy.get('.search-results')
                    .should('have.class', `${device}-layout`)
            })

            it(`should adapt cart sidebar for ${device}`, () => {
                // Add item to cart first
                cy.get('.product-card').first()
                    .find('.add-to-cart').click()
                
                cy.get('#cart-icon').click()
                
                if (device === 'mobile' || device === 'tablet') {
                    cy.get('.cart-overlay')
                        .should('have.class', 'full-screen')
                } else {
                    cy.get('.cart-sidebar')
                        .should('have.class', 'side-drawer')
                }
            })

            it(`should adjust checkout form for ${device}`, () => {
                // Navigate to checkout
                cy.get('.product-card').first()
                    .find('.add-to-cart').click()
                cy.get('#checkout-button').click()

                if (device === 'mobile') {
                    cy.get('.checkout-steps')
                        .should('have.class', 'vertical-steps')
                    cy.get('.payment-methods')
                        .should('have.class', 'stacked')
                } else {
                    cy.get('.checkout-steps')
                        .should('have.class', 'horizontal-steps')
                    cy.get('.payment-methods')
                        .should('have.class', 'grid')
                }
            })

            it(`should handle image galleries on ${device}`, () => {
                cy.get('.product-card').first().click()
                
                if (device === 'mobile') {
                    // Swipe gallery
                    cy.get('.product-gallery')
                        .should('have.class', 'swipe-enabled')
                        .trigger('swipeleft')
                } else {
                    // Thumbnail navigation
                    cy.get('.thumbnail-nav')
                        .should('be.visible')
                        .find('.thumb')
                        .first()
                        .click()
                }
            })

            it(`should adjust footer layout for ${device}`, () => {
                cy.get('footer').within(() => {
                    if (device === 'mobile') {
                        cy.get('.footer-columns')
                            .should('have.class', 'accordion')
                        cy.get('.footer-column-title')
                            .first()
                            .click()
                            .next()
                            .should('be.visible')
                    } else {
                        cy.get('.footer-columns')
                            .should('have.class', 'grid')
                        cy.get('.footer-column-content')
                            .should('be.visible')
                    }
                })
            })

            it(`should handle modals appropriately for ${device}`, () => {
                // Open quick view modal
                cy.get('.quick-view-trigger').first().click()
                
                if (device === 'mobile') {
                    cy.get('.modal-content')
                        .should('have.class', 'full-screen')
                        .and('have.css', 'width', '100%')
                } else {
                    cy.get('.modal-content')
                        .should('have.class', 'centered')
                        .and('have.css', 'max-width')
                }
            })
        })
    })

    it('should handle orientation changes', () => {
        cy.viewport('ipad-2', 'portrait')
        viewportWaits.waitForResize()
        cy.get('.product-grid')
            .should('have.class', 'portrait-layout')
        
        cy.viewport('ipad-2', 'landscape')
        viewportWaits.waitForResize()
        cy.get('.product-grid')
            .should('have.class', 'landscape-layout')
    })

    it('should maintain functionality during resize', () => {
        // Start with desktop view
        cy.viewport(1920, 1080)
        cy.get('#main-nav').should('be.visible')
        
        // Resize to mobile
        cy.viewport(375, 667)
        cy.get('#mobile-menu-toggle').should('be.visible')
        
        // Verify cart maintains items
        cy.get('#cart-count')
            .invoke('text')
            .should('equal', '0')
    })
})
