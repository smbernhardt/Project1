// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Import required packages
import '@cypress/xpath'
import '@testing-library/cypress'
import 'cypress-real-events'
import 'cypress-wait-until'
import 'cypress-file-upload'
import 'cypress-localstorage-commands'
import 'cypress-iframe'
import '@4tw/cypress-drag-drop'
import 'cypress-network-idle'

// Configure specific settings for each test type
Cypress.on('test:before:run', (test) => {
    // Viewport tests configuration
    if (test.title.includes('viewport')) {
        Cypress.config('viewportWidth', 1920)
        Cypress.config('viewportHeight', 1080)
    }

    // Action tests configuration
    if (test.title.includes('action')) {
        Cypress.config('defaultCommandTimeout', 15000)
        Cypress.config('animationDistanceThreshold', 20)
    }

    // Assertion tests configuration
    if (test.title.includes('assertion')) {
        Cypress.config('assertionTimeout', 8000)
    }

    // Utility tests configuration
    if (test.title.includes('utility')) {
        Cypress.config('requestTimeout', 15000)
        Cypress.config('responseTimeout', 30000)
    }
})

// Global beforeEach hook
beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
})
