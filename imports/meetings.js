import {check} from 'meteor/check';
import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

export const Meetings = new Mongo.Collection('meetings');

export function getDefaultDate() {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const date = now.getDate().toString().padStart(2, '0');
  return now.getFullYear() + '-' + month + '-' + date;
}

export function getDefaultTime() {
  const now = new Date();
  const hours = (now.getHours() + 1).toString().padStart(2, '0');
  return hours + ':00';
}

Meteor.methods({
  createMeeting() {
    // Make sure the user is logged in before inserting a task.
    //if (!this.userId) throw new Meteor.Error('createMeeting', 'not-authorized');

    //const {username} = Meteor.users.findOne(this.userId);
    const meeting = {
      name: '',
      date: getDefaultDate(),
      time: getDefaultTime(),
      duration: 30,
      status: 'not started',
      topics: []
      //username
    };
    meeting._id = Meetings.insert(meeting);
    return meeting;
  },

  deleteMeeting(meetingId) {
    check(meetingId, String);
    Meetings.remove(meetingId);
  },

  updateMeeting(meetingId, updates) {
    check(meetingId, String);
    check(updates, Object);
    // $set updates only specified properties.
    Meetings.update(meetingId, {$set: updates});
  }
});
