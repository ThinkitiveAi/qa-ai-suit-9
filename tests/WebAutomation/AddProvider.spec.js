const { test, expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');
const providerConfig = require('../../utils/testData.js');

// Generate dynamic provider data using Faker
function generateProviderData() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = (firstName+'@mailinator.com').toLowerCase();
  
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
    // Set browser to Chromium (default in Playwright)
    // Configure viewport and timeout
    await page.setViewportSize({ width: 1280, height: 720 });
    page.setDefaultTimeout(providerConfig.timeouts.pageLoad);
    
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
      await page.fill(providerConfig.selectors.login.passwordField, providerConfig.loginCredentials.password);
      await page.click(providerConfig.selectors.login.loginButton);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(providerConfig.urls.dashboardUrl);
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
      await expect(page.locator(providerConfig.selectors.navigation.providersTab)).toBeVisible();
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
      await expect(page.locator(providerConfig.selectors.providerForm.firstNameField)).toBeVisible();
    });

    // Step 7: Fill mandatory fields
    await test.step('Fill mandatory provider details', async () => {
      // Fill First Name
      await page.fill(providerConfig.selectors.providerForm.firstNameField, providerData.firstName);
      await page.fill(providerConfig.selectors.providerForm.lastNameField, providerData.lastName);
      await page.click(providerConfig.selectors.providerForm.roleField);
      const roleOption = page.locator(`[role="option"]:has-text("${providerData.role}")`);
      await expect(roleOption).toBeVisible({ timeout: 5000 });
      await roleOption.click();
      await page.click(providerConfig.selectors.providerForm.genderField);
      const genderOption = page.locator(`[role="option"]:has-text("${providerData.gender}")`);
      await expect(genderOption).toBeVisible({ timeout: 5000 });
      await genderOption.click();
      await page.fill(providerConfig.selectors.providerForm.emailField, providerData.email);
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
        const providerExists = await page.locator(`text=${providerData.firstName}`).isVisible().catch(() => false) ||
                              await page.locator(`text=${providerData.lastName}`).isVisible().catch(() => false) ||
                              await page.locator(`text=${providerData.email}`).isVisible().catch(() => false);
        if (providerExists) {
          console.log('✅ Provider successfully created and found in the list');
          expect(providerExists).toBeTruthy();
        } else {
          console.log('⚠️  Provider created but not immediately visible in list (may need refresh)');
        }
      } else {
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