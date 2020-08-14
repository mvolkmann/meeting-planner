import {Accounts} from 'meteor/accounts-base';
import secrets from '../secrets.json';

const siteName = 'Meeting Planner';
Accounts.emailTemplates.siteName = siteName;

const from = `${secrets.MAIL_NAME}<${secrets.MAIL_USER}@${secrets.MAIL_USER_DOMAIN}>`;
Accounts.emailTemplates.from = from;
