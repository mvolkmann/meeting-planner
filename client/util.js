import {Meteor} from 'meteor/meteor';

export function call(name, ...args) {
  return new Promise((resolve, reject) => {
    Meteor.call(name, ...args, (err, result) => {
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
