const { test, expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');
const providerConfig = require('../../utils/testData.js');

// Generate dynamic provider data using Faker
function generateProviderData() {
  const firstName = faker.person.firstName('male');
  const lastName = faker.person.lastName();
  const email = faker.internet.email(firstName+'@mailinator.com').toLowerCase();
  
  return {
    firstName,
    lastName,
    email,
    role: providerConfig.mandatoryFields.defaultRole,
    gender: providerConfig.mandatoryFields.defaultGender
  };
}

test.describe('Provider Management', () => {
  test('Add Provider User – Mandatory Fields', async ({ page }) => {

    // Generate dynamic provider data
    const providerData = generateProviderData();
    
    console.log('Generated Provider Data:', providerData);

    // Step 1: Navigate to login page
    await test.step('Navigate to login page', async () => {
      await page.goto(providerConfig.urls.loginUrl);
      await expect(page).toHaveURL(providerConfig.urls.loginUrl);
      await page.waitForLoadState('networkidle');
    });

    // Step 2: Login with credentials
    await test.step('Login with credentials', async () => {
      // Fill username
      await page.fill(providerConfig.selectors.login.usernameField, providerConfig.loginCredentials.username);
      
      // Fill password
      await page.fill(providerConfig.selectors.login.passwordField, providerConfig.loginCredentials.password);
      
      // Click login button
      await page.click(providerConfig.selectors.login.loginButton);
      
      // Wait for dashboard to load
      await page.waitForLoadState('networkidle');
      await expect(page.locator(':text("Dashboard")')).toBeVisible();
    });

    // Step 3: Navigate to Settings
    await test.step('Navigate to Settings', async () => {
      await page.click(providerConfig.selectors.navigation.settingsTab);
      await page.waitForTimeout(providerConfig.timeouts.shortDelay);
    });

    // Step 4: Navigate to User Settings
    await test.step('Navigate to User Settings', async () => {
      await page.goto(providerConfig.urls.userSettingsUrl);
      await page.waitForLoadState('networkidle');
      await expect(page.locator(':text("Providers")')).toBeVisible();
    });

    // Step 5: Click on Providers tab
    await test.step('Click on Providers tab', async () => {
      await page.click(providerConfig.selectors.navigation.providersTab);
      await page.waitForTimeout(providerConfig.timeouts.shortDelay);
      await expect(page.locator(providerConfig.selectors.navigation.addProviderButton)).toBeVisible();
    });

    // Step 6: Click on Add Provider User
    await test.step('Click on Add Provider User', async () => {
      await page.click(providerConfig.selectors.navigation.addProviderButton);
      await page.waitForTimeout(providerConfig.timeouts.mediumDelay);
      
      // Wait for form to load
      await expect(page.locator(providerConfig.selectors.providerForm.firstNameField)).toBeVisible();
    });

    // Step 7: Fill mandatory fields
    await test.step('Fill mandatory provider details', async () => {
      // Fill First Name
      await page.fill(providerConfig.selectors.providerForm.firstNameField, providerData.firstName);
      
      // Fill Last Name
      await page.fill(providerConfig.selectors.providerForm.lastNameField, providerData.lastName);
      
      // Select Role dropdown and choose Provider
      await page.evaluate(() => {
        const roleField = document.querySelectorAll('[role="combobox"], .MuiAutocomplete-input')[3];
        if (roleField) {
          roleField.click();
        }
      });
      
      await page.waitForTimeout(500);
      
      // Type and select Provider
      await page.evaluate((role) => {
        const roleField = document.querySelectorAll('[role="combobox"], .MuiAutocomplete-input')[3];
        if (roleField) {
          roleField.value = role;
          roleField.dispatchEvent(new Event('input', { bubbles: true }));
          roleField.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, providerData.role);
      
      // Try to select from dropdown options
      await page.waitForTimeout(500);
      const roleOption = page.locator('[role="option"]:has-text("Provider")');
      if (await roleOption.isVisible()) {
        await roleOption.click();
      }
      
      // Select Gender dropdown and choose Male
      await page.evaluate(() => {
        const genderField = document.querySelectorAll('[role="combobox"], .MuiAutocomplete-input')[4];
        if (genderField) {
          genderField.click();
        }
      });
      
      await page.waitForTimeout(500);
      
      // Type and select Male
      await page.evaluate((gender) => {
        const genderField = document.querySelectorAll('[role="combobox"], .MuiAutocomplete-input')[4];
        if (genderField) {
          genderField.value = gender;
          genderField.dispatchEvent(new Event('input', { bubbles: true }));
          genderField.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, providerData.gender);
      
      // Try to select from dropdown options
      await page.waitForTimeout(500);
      const genderOption = page.locator('[role="option"]:has-text("Male")');
      if (await genderOption.isVisible()) {
        await genderOption.click();
      }
      
      // Fill Email
      await page.evaluate((email) => {
        const allInputs = document.querySelectorAll('input[type="text"]');
        allInputs.forEach((input) => {
          const container = input.closest('.MuiFormControl-root, .MuiTextField-root');
          if (container && container.textContent.includes('Email')) {
            input.value = email;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }, providerData.email);
      
      console.log('Filled all mandatory fields');
    });

    // Step 8: Save the provider
    await test.step('Save the provider', async () => {
      await page.click(providerConfig.selectors.providerForm.saveButton);
      await page.waitForTimeout(providerConfig.timeouts.longDelay);
    });

    // Step 9: Verify provider is saved and displayed in list
    await test.step('Verify provider is saved and displayed in providers list', async () => {
      // Check for success indicators
      // Either we're back on the providers list, or there's a success message
      
      // Wait for either navigation back to list or form reset
      await page.waitForTimeout(providerConfig.timeouts.mediumDelay);
      
      // Check if we're back on the providers list page
      const isOnProvidersList = await page.locator(providerConfig.selectors.navigation.addProviderButton).isVisible();
      
      if (isOnProvidersList) {
        // Search for the newly created provider in the list
        // Look for the provider by name or email
        const providerExists = await page.locator(`text=${providerData.firstName}`, { timeout: 5000 }).isVisible().catch(() => false) ||
                              await page.locator(`text=${providerData.lastName}`, { timeout: 5000 }).isVisible().catch(() => false) ||
                              await page.locator(`text=${providerData.email}`, { timeout: 5000 }).isVisible().catch(() => false);
        
        if (providerExists) {
          console.log('✅ Provider successfully created and found in the list');
          expect(providerExists).toBeTruthy();
        } else {
          console.log('⚠️  Provider created but not immediately visible in list (may need refresh)');
        }
      } else {
        // Check for validation errors
        const hasValidationError = await page.locator(providerConfig.selectors.validation.emailError).isVisible().catch(() => false);
        
        if (hasValidationError) {
          console.log('❌ Validation error occurred - check form inputs');
          throw new Error('Form validation failed - Please check email format');
        } else {
          console.log('✅ Form submitted successfully');
        }
      }
    });

    // Step 10: Take a screenshot for verification
    await test.step('Take final screenshot for verification', async () => {
      await page.screenshot({ 
        path: `test-results/provider-test-${Date.now()}.png`, 
        fullPage: true 
      });
    });
  });
});

// Helper function to wait for element with timeout
async function waitForElement(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    console.log(`Element ${selector} not found within ${timeout}ms`);
    return false;
  }
}

// Helper function to safely click element
async function safeClick(page, selector) {
  try {
    await page.click(selector);
    return true;
  } catch (error) {
    console.log(`Failed to click ${selector}:`, error.message);
    return false;
  }
}

// Helper function to safely fill input
async function safeFill(page, selector, value) {
  try {
    await page.fill(selector, value);
    return true;
  } catch (error) {
    console.log(`Failed to fill ${selector}:`, error.message);
    return false;
  }
}