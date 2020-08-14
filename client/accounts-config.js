import {Accounts} from 'meteor/accounts-base';

// Email is needed for the next step.
Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});
