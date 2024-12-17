const viewports = {
    mobile: [375, 667],
    tablet: [768, 1024],
    desktop: [1920, 1080]
}

const waitHelpers = {
    // Wait for network requests to complete
    waitForNetworkIdle: () => {
        return cy.window().then(win => {
            return new Cypress.Promise(resolve => {
                let requestCount = 0
                const originalXHR = win.XMLHttpRequest
                win.XMLHttpRequest = function() {
                    requestCount++
                    const xhr = new originalXHR()
                    xhr.addEventListener('loadend', () => {
                        requestCount--
                        if (requestCount === 0) resolve()
                    })
                    return xhr
                }
            })
        })
    },

    // Wait for animations to complete
    waitForAnimations: () => {
        cy.get('body').then($body => {
            if ($body.find(':animated').length) {
                cy.wait(500).waitForAnimations()
            }
        })
    },

    // Wait for page load with timeout
    waitForPageLoad: () => {
        cy.window().then(win => {
            return new Cypress.Promise(resolve => {
                if (win.document.readyState === 'complete') {
                    resolve()
                } else {
                    win.addEventListener('load', resolve)
                }
            })
        })
    }
}

// Add custom commands
Cypress.Commands.add('waitForLoader', () => {
    cy.get('#loader', { timeout: 10000 }).should('not.exist')
})

Cypress.Commands.add('waitForResponse', (alias) => {
    cy.wait(alias).its('response.statusCode').should('eq', 200)
})

describe('Sweetshop.com Utilities', () => {
    let testData;

    before(() => {
        cy.fixture('data_fixture.json').then((data) => {
            testData = data;
        });
    });

    beforeEach(() => {
        cy.viewport(viewports.desktop[0], viewports.desktop[1])
        cy.visit('https://sweetshop.com')
        cy.get('#accept-cookies').click()
    })

    // Helper function to format currency
    const formatPrice = (price) => `$${Number(price).toFixed(2)}`

    // Helper function to generate random test data
    const generateTestData = () => ({
        email: `test${Date.now()}@example.com`,
        firstName: 'Test',
        lastName: 'User',
        address: '123 Test St',
        phone: '1234567890'
    })

    it('should handle currency formatting across the site', () => {
        const testPrices = [10, 10.5, 10.55, 10.555]
        
        testPrices.forEach(price => {
            cy.get('.product-card').first()
                .find('.product-price')
                .invoke('text')
                .should('match', /^\$\d+\.\d{2}$/)
        })
    })

    it('should validate email format in forms', () => {
        cy.get('#newsletter-form').within(() => {
            // Test valid emails
            testData.formData.validEmails.forEach(email => {
                cy.get('#email')
                    .clear()
                    .type(email)
                    .blur()
                    .should('not.have.class', 'error')
            })

            // Test invalid emails
            testData.formData.invalidEmails.forEach(email => {
                cy.get('#email')
                    .clear()
                    .type(email)
                    .blur()
                    .should('have.class', 'error')
            })
        })
    })

    it('should handle pagination utilities', () => {
        testData.pageSizes.forEach(size => {
            cy.get('#page-size-select').select(size.toString())
            cy.waitForLoader()
            waitHelpers.waitForNetworkIdle()
            cy.get('.product-card')
                .should('have.length', size)
            cy.url().should('include', `page_size=${size}`)
        })
    })

    it('should manage local storage data', () => {
        const testCart = {
            items: [
                { id: 1, quantity: 2 },
                { id: 2, quantity: 1 }
            ]
        }

        // Set cart data
        window.localStorage.setItem('cart', JSON.stringify(testCart))
        
        // Reload and verify persistence
        cy.reload()
        cy.window().then(win => {
            const savedCart = JSON.parse(win.localStorage.getItem('cart'))
            expect(savedCart).to.deep.equal(testCart)
        })
    })

    it('should handle form data persistence', () => {
        const testData = generateTestData()
        
        cy.intercept('POST', '/api/form-data').as('formSubmit')
        
        // Fill form
        cy.get('#contact-form').within(() => {
            cy.get('#email').type(testData.email)
            waitHelpers.waitForAnimations() // Wait for any validation animations
            cy.get('#first-name').type(testData.firstName)
            cy.get('#last-name').type(testData.lastName)
        })

        cy.get('#submit-form').click()
        cy.waitForResponse('@formSubmit') // Wait for form submission
    })

    it('should handle URL parameter utilities', () => {
        // Test search parameters
        const searchParams = {
            category: 'chocolate',
            sort: 'price-asc',
            filter: 'in-stock'
        }

        const queryString = new URLSearchParams(searchParams).toString()
        cy.visit(`https://sweetshop.com/products?${queryString}`)

        // Verify URL parameters reflected in UI
        cy.get('#category-filter').should('have.value', searchParams.category)
        cy.get('#sort-select').should('have.value', searchParams.sort)
        cy.get('#stock-filter').should('be.checked')
    })

    it('should validate phone number formats', () => {
        const phoneFormats = {
            valid: ['1234567890', '123-456-7890', '(123) 456-7890'],
            invalid: ['123', '123456', 'abcdefghij']
        }

        cy.get('#contact-form').within(() => {
            // Test valid phone numbers
            phoneFormats.valid.forEach(phone => {
                cy.get('#phone')
                    .clear()
                    .type(phone)
                    .blur()
                    .should('not.have.class', 'error')
            })

            // Test invalid phone numbers
            phoneFormats.invalid.forEach(phone => {
                cy.get('#phone')
                    .clear()
                    .type(phone)
                    .blur()
                    .should('have.class', 'error')
            })
        })
    })

    it('should handle date formatting utilities', () => {
        const testDates = [
            { input: '2023-12-25', expected: 'December 25, 2023' },
            { input: '2024-01-01', expected: 'January 1, 2024' }
        ]

        // Test date formatting in order history
        cy.get('#order-history').within(() => {
            testDates.forEach(({ input, expected }) => {
                cy.get('.order-date')
                    .contains(expected)
                    .should('exist')
            })
        })
    })
})
