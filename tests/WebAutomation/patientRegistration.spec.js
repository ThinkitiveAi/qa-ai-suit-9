const { test, expect } = require('@playwright/test');
const { faker } = require('@faker-js/faker');
const testData = require('../../utils/testData');
const sharedTestData = require('../../utils/sharedTestData');

// Utility function to get dynamic patient details
function getPatientDetails() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
//const birthDate = '07-20-1995';       //faker.helpers.arrayElement(['07-20-1995', '12-25-1988','11-04-1994','10-30-1997']);
const dob = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });

// Manually format to MM/DD/YYYY
const mm = String(dob.getMonth() + 1).padStart(2, '0');
const dd = String(dob.getDate()).padStart(2, '0');
const yyyy = dob.getFullYear();

const birthDate = `${mm}-${dd}-${yyyy}`;
  return {
    firstName,
    lastName,
    birthDate,
    gender: faker.helpers.arrayElement(['Male', 'FeMale']),
    mobileNumber: faker.phone.number('##########'),
    email: firstName + '@mailinator.com'
  };
}

test('Patient Registration', async ({ page, context }) => {
  try {
    const patient = getPatientDetails();
    // Navigate to the staging URL
    await page.goto(testData.url);

    // Login with provided credentials
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', testData.username);
    await page.fill('input[type="password"]', testData.password);
    await page.click('button:has-text("Let\'s get Started")');

    // Wait for navigation after login
    await page.waitForURL(/.*\/app\/provider\/.*/, { timeout: 15000 });

    // Navigate to Patients section
    await page.click('button:has-text("Patients")');
    await page.click('//p[contains(text(), "Patient List")]');
    await page.waitForTimeout(3000);

 // Click Create button
  await page.click('span:has-text("Create")');

  // Click New Patient option
  await page.click('li:has-text("New Patient")');

  // Click Enter Patient Details
  await page.click('p:has-text("Enter Patient Details")');

  // Click Next button
  await page.click('button:has-text("Next")');

    // Wait for form to load
    await page.waitForSelector('input[name="firstName"]', { timeout: 10000 });

    // Fill mandatory Patient Details using reusable data
    await page.fill('input[name="firstName"]', patient.firstName);
    await page.fill('input[name="lastName"]', patient.lastName);
    await page.fill('input[name="birthDate"]', patient.birthDate);
    
    // Select Gender from dropdown
    await page.click('input[name="gender"]');
    await page.waitForSelector(`li:has-text("${patient.gender}")`, { timeout: 5000 });
    await page.click(`li:has-text("${patient.gender}")`);

    // Fill mandatory Contact Info
    await page.fill('input[name="mobileNumber"]', patient.mobileNumber);
    await page.fill('input[name="email"]', patient.email);

    // Click Save button
    await page.click('button:has-text("Save")');

    // Wait for patient to be saved
    await page.waitForTimeout(7000);
    const patientFullName = patient.firstName + "  " + patient.lastName;
    console.log("Verifying patient in list:", patientFullName);
    
    // Manually check for patient visibility and throw a custom error if not found
    const isPatientVisible = await page.isVisible(`//p[contains(text(), "${patientFullName}")]`);
    //console.log('Actual Patient name: '+await page.locator(`//p[contains(text(), "${patientFullName}")]`).first().textContent());
       
    if (!isPatientVisible) {
       throw new Error(`Patient ${patientFullName} was not found in the patient list!`);
    }
    else{
    sharedTestData.registeredFirstName = patient.firstName;
    sharedTestData.registeredLastName = patient.lastName;
    console.log('patient registration test completed successfully');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
});



