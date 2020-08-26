import {Meteor} from 'meteor/meteor';

export function call(name, ...args) {
  return new Promise((resolve, reject) => {
    //console.log('util.js call: name =', name);
    //console.log('util.js call: args =', args);
    Meteor.call(name, ...args, (err, result) => {
      //console.log('util.js call: err =', err);
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export function handleError(err) {
  // Replace this will better error handling later.
  if (err) alert(err.message);
}

export const isActive = meeting =>
  ['started', 'paused', 'resumed'].includes(meeting.status);
