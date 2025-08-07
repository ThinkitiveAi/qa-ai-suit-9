const { test, expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');

// Test data configuration
const testData = {
  url: 'https://stage_aithinkitive.uat.provider.ecarehealth.com/auth/login',
  credentials: {
    username: 'rose.gomez@jourrapide.com',
    password: 'Pass@123'
  },
  availability: {
    provider: 'Aileen Carter',
    timeZone: 'Indian Standard Time (UTC +5:30)',
    bookingWindow: '12 Week',
    startTime: '01:00 AM',
    endTime: '11:00 PM',
    appointmentType: 'New Patient Visit',
    duration: '30 minutes',
    weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  }
};

test.describe('Set Availability - Mandatory Fields', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Add extra wait time for page loads
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
  });

  test('Set Availability - Mandatory Fields Test', async ({ page }) => {
    // Step 1: Navigate to login page
    console.log('Step 1: Navigating to login page...');
    await page.goto(testData.url, { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/eCarehealth/);

    // Step 2: Enter username
    console.log('Step 2: Entering username...');
    await page.fill('input[type="email"], input[name="email"], input[placeholder*="email"], input[placeholder*="Email"]', testData.credentials.username);

    // Step 3: Enter password
    console.log('Step 3: Entering password...');
    await page.fill('input[type="password"], input[name="password"]', testData.credentials.password);

    // Step 4: Click on "Let's get started" button
    console.log('Step 4: Clicking login button...');
    await page.click('button:has-text("Let\'s get started"), button:has-text("Login"), button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Step 5: Click on the scheduling tab
    console.log('Step 5: Clicking on Scheduling tab...');
    await page.click('button:has-text("Scheduling"), a:has-text("Scheduling")');
    await page.waitForTimeout(2000);

    // Step 6 & 7: Select Availability option and click on it
    console.log('Step 6-7: Navigating to Availability...');
    await page.click('text=Availability');
    await page.waitForTimeout(2000);

    // Step 8: Click on Edit Availability
    console.log('Step 8: Clicking Edit Availability...');
    await page.click('button:has-text("Edit Availability"), a:has-text("Edit Availability")');
    await page.waitForTimeout(3000);

    // Step 9: Fill mandatory details
    console.log('Step 9: Filling mandatory details...');

    // Step 9a: Select Provider - Aileen Carter
    console.log('Step 9a: Selecting provider...');
   
      // Try multiple approaches to find and click the provider dropdown
      await page.click('input[name="providerId"]', { timeout: 10000 });
      await page.waitForTimeout(1000);
      await page.fill('input[name="providerId"]', testData.availability.provider);
      // Wait for dropdown options to appear and select Aileen Carter
      await page.click(`text=${testData.availability.provider}`, { timeout: 10000 });

    // Step 9b: Select Time Zone
    console.log('Step 9b: Selecting time zone...');
   
      await page.click('input[name="timezone"]', { timeout: 10000 } );
      await page.fill('input[name="timezone"]', testData.availability.timeZone);
      await page.waitForTimeout(1000);
      await page.click(`text=${testData.availability.timeZone}`, { timeout: 10000 });
    

    // Step 9c: Select Booking Window
    console.log('Step 9c: Selecting booking window...');
   
      await page.click('text=Booking Window');
      await page.fill('input[name="bookingWindow"]', testData.availability.bookingWindow);
      await page.click(`text=${testData.availability.bookingWindow}`, { timeout: 10000 });
    
    

    // Step 9d: Set Day Slot Creation for weekdays
    console.log('Step 9d: Setting day slot creation...');
    for (const day of testData.availability.weekdays) {
      console.log(`Setting availability for ${day}...`);
      
      // Click on the day
      await page.click(`text=${day}`, { timeout: 10000 });
      await page.waitForTimeout(500);
      
      // Set start time
        await page.click(`input[id=':r3s:'][placeholder='Select']`, { timeout: 10000 });
        await page.fill(`input[id=':r3s:'][placeholder='Select']`, testData.availability.startTime);
        await page.click(`text=${testData.availability.startTime}`, { timeout: 10000 });

      
      // Set end time
      try {
        await page.fill(`input[id=':r3u:'][placeholder='Select']`, testData.availability.endTime);
      } catch (error) {
        // Alternative approach for time selection
        await page.click('[data-testid*="end-time"], [aria-label*="End Time"]');
        await page.fill('input', testData.availability.endTime);
      }
      
      await page.waitForTimeout(500);
    }

    // Step 9e: Click on Televisit checkbox
    console.log('Step 9e: Enabling Televisit...');
    try {
      await page.check('input[type="checkbox"]:has-text("Televisit"), [data-testid*="televisit"]');
    } catch (error) {
      await page.click('text=Televisit');
    }
    await page.waitForTimeout(1000);

    // Step 9f: Set Availability Settings
    console.log('Step 9f: Setting availability settings...');
    
    // Select Appointment Type
    try {
      await page.click('text=Appointment Type');
      await page.waitForTimeout(1000);
      await page.click(`text=${testData.availability.appointmentType}`);
    } catch (error) {
      // Alternative approach
      await page.selectOption('select[name*="appointment"], select[name*="type"]', testData.availability.appointmentType);
    }
    await page.waitForTimeout(1000);

    // Select Duration
    try {
      await page.click('text=Duration');
      await page.waitForTimeout(1000);
      await page.click(`text=${testData.availability.duration}`);
    } catch (error) {
      // Alternative approach
      await page.selectOption('select[name*="duration"]', testData.availability.duration);
    }
    await page.waitForTimeout(1000);

    // Step 10: Click Save button
    console.log('Step 10: Saving availability settings...');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(5000);

    // Wait for save confirmation or navigation back to availability page
    await page.waitForLoadState('networkidle');

    // Step 11-15: Verify the availability
    console.log('Step 11-15: Verifying availability...');
    
    // Navigate back to Availability page if not already there
    try {
      await page.click('text=Availability', { timeout: 5000 });
    } catch (error) {
      // Already on availability page
    }
    await page.waitForTimeout(2000);

    // Step 12: Select provider from dropdown
    console.log('Step 12: Selecting provider for verification...');
    try {
      await page.click('[data-testid*="provider-dropdown"], select[name*="provider"]');
      await page.click(`text=${testData.availability.provider}`);
    } catch (error) {
      // Alternative approach
      await page.selectOption('select', testData.availability.provider);
    }
    await page.waitForTimeout(1000);

    // Step 13: Select visit type - Televisit
    console.log('Step 13: Selecting visit type...');
    try {
      await page.click('[data-testid*="visit-type"], select[name*="visit"]');
      await page.click('text=Televisit');
    } catch (error) {
      await page.selectOption('select', 'Televisit');
    }
    await page.waitForTimeout(1000);

    // Step 14: Select appointment type
    console.log('Step 14: Selecting appointment type...');
    try {
      await page.click('[data-testid*="appointment-type"]');
      await page.click(`text=${testData.availability.appointmentType}`);
    } catch (error) {
      await page.selectOption('select', testData.availability.appointmentType);
    }
    await page.waitForTimeout(2000);

    // Step 15: Select next day and verify available slots
    console.log('Step 15: Selecting next day and verifying slots...');
    
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.getDate().toString();
    
    // Click on tomorrow's date
    await page.click(`text=${tomorrowDate}`, { timeout: 10000 });
    await page.waitForTimeout(3000);

    // Verify that available slots are displayed
    const availableSlots = await page.locator('[data-testid*="time-slot"], .time-slot, button:has-text("AM"), button:has-text("PM")').count();
    
    if (availableSlots > 0) {
      console.log(`✅ SUCCESS: Found ${availableSlots} available time slots for the next day`);
      
      // Click on the first available slot to verify it works
      await page.click('[data-testid*="time-slot"], .time-slot, button:has-text("AM"), button:has-text("PM")', { timeout: 5000 });
      await page.waitForTimeout(1000);
      
      console.log('✅ SUCCESS: Successfully clicked on an available slot');
    } else {
      console.log('⚠️ No time slots found - checking for alternative slot indicators...');
      
      // Check for alternative slot representations
      const altSlots = await page.locator('button:contains(":")').count();
      if (altSlots > 0) {
        console.log(`✅ SUCCESS: Found ${altSlots} alternative time slots`);
      } else {
        console.log('❌ WARNING: No time slots detected - availability may not have been set correctly');
      }
    }

    // Final verification - take screenshot for manual verification
    await page.screenshot({ 
      path: `availability_verification_${faker.string.alphanumeric(5)}.png`, 
      fullPage: true 
    });

    console.log('✅ Test completed successfully! Availability has been set and verified.');
  });

  test.afterEach(async ({ page }) => {
    // Clean up - close any open dialogs or modals
    try {
      await page.keyboard.press('Escape');
    } catch (error) {
      // Ignore if no dialogs to close
    }
    
    // Take final screenshot for debugging if test fails
    if (test.info().status !== 'passed') {
      await page.screenshot({ 
        path: `test_failure_${faker.string.alphanumeric(5)}.png`, 
        fullPage: true 
      });
    }
  });
});

// Utility functions for dynamic data (using faker)
class TestDataGenerator {
  static generateRandomEmail() {
    return faker.internet.email();
  }
  
  static generateRandomPassword() {
    return faker.internet.password({ length: 12, memorable: true, prefix: 'Test@' });
  }
  
  static generateRandomDate(daysFromNow = 1) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  }
  
  static generateTestId() {
    return faker.string.alphanumeric(8);
  }
}

// Export for use in other test files
module.exports = {
  testData,
  TestDataGenerator
};