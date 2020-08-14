import {Accounts} from 'meteor/accounts-base';
import secrets from '../secrets.json';

const siteName = 'Meeting Planner';
Accounts.emailTemplates.siteName = siteName;

const from = `${secrets.MAIL_NAME}<${secrets.MAIL_USER}@${secrets.MAIL_USER_DOMAIN}>`;
Accounts.emailTemplates.from = from;

Accounts.onLogin(({user}) => {
  const [email] = user.emails;
  if (!email.verified) {
    Accounts.sendVerificationEmail(user._id, email.address);
  }
});

Accounts.emailTemplates.verifyEmail = {
  subject() {
    return `Activate your ${siteName} account`;
  },
  text(user, url) {
    return (
      `Hey ${user.username}, click the following link ` +
      `to verify your email address: ${url}.`
    );
  }
};
