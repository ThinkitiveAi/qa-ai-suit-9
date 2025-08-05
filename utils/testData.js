
  const providerConfig = {
  // Login credentials
  loginCredentials: {
    username: 'rose.gomez@jourrapide.com',
    password: 'Pass@123'
  },

  // Application URLs
  urls: {
    baseUrl: 'https://stage_aithinkitive.uat.provider.ecarehealth.com',
    loginUrl: 'https://stage_aithinkitive.uat.provider.ecarehealth.com/auth/login',
    dashboardUrl: 'https://stage_aithinkitive.uat.provider.ecarehealth.com/app/provider/dashboard',
    ScheduleUrl:'https://stage_aithinkitive.uat.provider.ecarehealth.com/app/provider/scheduling/appointment',
    userSettingsUrl: 'https://stage_aithinkitive.uat.provider.ecarehealth.com/app/provider/settings/user-settings'
  },

  // Provider form mandatory fields
  mandatoryFields: {
    roles: ['Provider', 'Admin', 'Staff'],
    genders: ['Male', 'Female', 'Others'],
    defaultRole: 'Provider',
    defaultGender: 'Male'
  },


  // Test data templates
  testDataTemplates: {
    provider: {
      firstName: 'Samual',
      lastName: 'Wilson',
      email: 'samual@mailinator.com',
      role: 'Provider',
      gender: 'Male'
    }
  },

  // Timeouts and delays
  timeouts: {
    pageLoad: 30000,
    elementWait: 10000,
    shortDelay: 1000,
    mediumDelay: 2000,
    longDelay: 3000
  },

  // Selectors (to make maintenance easier)
  selectors: {
    login: {
      usernameField: 'input[name="username"]',
      passwordField: 'input[type="password"]',
      loginButton: 'button:has-text("Let\'s get Started")'
    },
    navigation: {
      settingsTab: '[data-testid="menu-item-settings"], :text("Settings")',
      providersTab: ':text("Providers")',
      addProviderButton: ':text("Add Provider User")'
    },
    providerForm: {
      firstNameField: 'input[placeholder="First Name"]',
      lastNameField: 'input[placeholder="Last Name"]',
      roleField: '//input[@name="role"]',
      genderField: '//input[@name="gender"]',
      emailField: 'input[placeholder*="Enter Email"]',
      saveButton: ':text("Save")'
    },
    validation: {
      emailError: ':text("Please Enter a valid Email")',
      requiredFieldError: ':text("This field is required")'
    }
  },

  // Environment-specific settings
  environments: {
    staging: {
      baseUrl: 'https://stage_aithinkitive.uat.provider.ecarehealth.com',
      apiUrl: 'https://api-stage.ecarehealth.com'
    },
    production: {
      baseUrl: 'https://provider.ecarehealth.com',
      apiUrl: 'https://api.ecarehealth.com'
    }
  }
};

module.exports = providerConfig;
