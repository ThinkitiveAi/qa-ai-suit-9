const { test, expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');
const testData = require('../../utils/testData');
const sharedTestData = require('../../utils/sharedTestData');
const { start } = require('repl');

// Shared variable to store selected slot time
let selectedSlotTime;
// Utility function to get dynamic appointment details
function getAppointmentDetails() {
  let patientName;
  if (sharedTestData.registeredFirstName && sharedTestData.registeredLastName) {
    patientName = `${sharedTestData.registeredFirstName} ${sharedTestData.registeredLastName}`;
  } else {
    patientName = 'Dustin Carroll'; // fallback
  }
  const appointmentDay = '28';
  //const appointmentTime = '01:30 AM'
  const appointmentTime = faker.helpers.arrayElement([
     '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM','01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
    '09:30 AM', '10:30 AM', '11:30 AM', '12:30 PM','01:30 PM', '02:30 PM', '03:30 PM', '04:30 PM', '05:30 PM', '06:30 PM', '07:30 PM'
  ]);
  return {
    patientName,
    appointmentDay,
    appointmentTime,
    appointmentDate: `07/${appointmentDay}/2025`,
    reason: 'Fever',
    appointmentType: 'New Patient Visit',
    timezone: 'Indian Standard Time (GMT +05:30)',
    visitType: 'Telehealth',
    provider: 'Robert Jones',
  };
}

test.describe.serial('Appointment Scheduling', () => {
  test('Appointment Scheduling', async ({ page }) => {
    try {
      const appointment = getAppointmentDetails();
      // Navigate to the staging URL
      await page.goto(testData.urls.loginUrl);

      // Login with provided credentials
      await page.waitForSelector('input[name="username"]', { timeout: 10000 });
      await page.fill('input[name="username"]', testData.loginCredentials.username);
      await page.fill('input[type="password"]', testData.loginCredentials.password);
      await page.click('button:has-text("Let\'s get Started")');

      // Wait for navigation after login
      await page.waitForURL(/.*\/app\/provider\/.*/, { timeout: 15000 });

      // Click Create button
      await page.click('span:has-text("Create")');

      // Click New Appointment option
      await page.click('li:has-text("New Appointment")');

      // Wait for appointment form to load
      await page.waitForSelector('input[name="patientId"]', { timeout: 10000 });

      // Fill appointment details
      await page.click('input[name="patientId"]');
      await page.fill('input[name="patientId"]', appointment.patientName);
      await page.waitForTimeout(1000);
      await page.click(`li:has-text("${appointment.patientName}")`);

      // Select Appointment Type
      await page.click('input[name="type"]');
      await page.waitForSelector(`li:has-text("${appointment.appointmentType}")`, { timeout: 5000 });
      await page.click(`li:has-text("${appointment.appointmentType}")`);

      // Fill Reason for visit
      await page.fill('input[name="chiefComplaint"]', appointment.reason);

      // Select Timezone
      await page.click('input[name="timezone"]');
      await page.waitForSelector(`li:has-text("${appointment.timezone}")`, { timeout: 5000 });
      await page.click(`li:has-text("${appointment.timezone}")`);

      // Select Visit Type
      await page.click(`button:has-text("${appointment.visitType}")`);

      // Select Provider
      await page.click('input[placeholder="Search Provider"]');
      await page.fill('input[placeholder="Search Provider"]', appointment.provider);
      await page.waitForSelector(`li:has-text("${appointment.provider}")`, { timeout: 5000 });
      await page.click(`li:has-text("${appointment.provider}")`);

      // Click View Availability
      await page.click('button:has-text("View Availability")');
      await page.waitForTimeout(2000);

      // Select date (by day number)
      await page.click(`(//div[contains(@class, "MuiDateCalendar-root")])[2]//button[contains(@class, "MuiPickersDay-root") and normalize-space(text())='${appointment.appointmentDay}']`);
      await page.waitForTimeout(1000);

      const getSlotTime = await page.locator('xpath=/html/body//div[2]/div/div/div[1]/button/p');
      const slotTime = await getSlotTime.textContent();
      console.log('Available Slot Time:', slotTime);

      if (!slotTime) {
        selectedSlotTime = appointment.appointmentTime;
         await page.click(`//button[p[starts-with(normalize-space(text()), '${appointment.appointmentTime}')]]`);
        }
        else {
       const startTime = slotTime.split('-')[0].trim();
       selectedSlotTime = startTime;
          await page.click(`//button[p[starts-with(normalize-space(text()), '${slotTime}')]]`);
        }


      // Save the appointment
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (let button of buttons) {
          if (button.textContent?.includes('Save And Close')) {
            button.click();
            break;
          }
        }
      });

      // Wait for appointment to be saved
      await page.waitForTimeout(5000);

    
      await page.click(`(//button[contains(@class, 'MuiPickersDay-root')])[${appointment.appointmentDay}]`);
      await page.waitForTimeout(2500);

    
      // Verify appointment is visible in the list
      const isDateVisible = await page.isVisible(`//p[contains(text(), '${appointment.appointmentDate}')]`);
      const dateTexts = await page.locator(`//p[contains(text(), '${appointment.appointmentDate}')]`).allTextContents();
      console.log('Date locator text(s):', dateTexts);
      const isTimeVisible = await page.isVisible(`//p[contains(text(), '${selectedSlotTime}')]`);
      const timeTexts = await page.locator(`//p[contains(text(), '${selectedSlotTime}')]`).allTextContents();
      console.log('Time locator text(s):', timeTexts);
      const isProviderVisible = await page.isVisible(`//p[contains(text(), '${appointment.provider}')]`);
      const providerTexts = await page.locator(`//p[contains(text(), '${appointment.provider}')]`).allTextContents();
      console.log('Provider locator text(s):', providerTexts);
     
      const isPatientVisible = await page.isVisible(`//p[contains(text(), '${appointment.patientName}')]`);
      const patientTexts = await page.locator(`//p[contains(text(), '${appointment.patientName}')]`).allTextContents();
      console.log('Provider locator text(s):', patientTexts);

      if (!isDateVisible & !isTimeVisible & isProviderVisible & !isPatientVisible) {
        throw new Error(`Appointment for ${appointment.patientName} on ${appointment.appointmentDate} at ${appointment.appointmentTime} was not found in the list!`);
      } else {
        console.log('Appointment scheduling test completed successfully');
      }
    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});
