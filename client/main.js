import {Meteor} from 'meteor/meteor';
import App from './App.svelte';
import './accounts-config.js';

Meteor.startup(() => {
  new App({target: document.getElementById('app')});
});
