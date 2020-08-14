import {Meteor} from 'meteor/meteor';
import './accounts-setup.js';
import '../imports/meetings.js';
import secrets from '../secrets.json';

Meteor.startup(() => {
  process.env.MAIL_URL =
    'smtp://' +
    secrets.MAIL_USER +
    '%40' +
    secrets.MAIL_USER_DOMAIN +
    ':' +
    secrets.MAIL_PASSWORD +
    '@' +
    secrets.MAIL_SERVER_DOMAIN +
    ':' +
    secrets.MAIL_SERVER_PORT;
});
