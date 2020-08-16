import {check, Match} from 'meteor/check';
import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Meetings = new Mongo.Collection('meetings');
const topicSchema = new SimpleSchema({
  description: {type: String, defaultValue: ''},
  presenter: {type: String, defaultValue: ''},
  minutes: {type: Number, defaultValue: 0}
});
Meetings.schema = new SimpleSchema({
  name: {type: String, defaultValue: ''},
  date: String,
  time: String,
  duration: SimpleSchema.Integer,
  topics: [topicSchema]
});
Meetings.attachSchema(Meetings.schema);

if (Meteor.isServer) {
  // This is only run on the server.
  // An arrow function cannot be used here
  // if we need to use the "this" keyword.
  // If no query is provided, the entire collection is published.
  // A second argument can be passed to the find method which is
  // an object where the keys are names of properties.
  // The values are booleans that either specify which properties
  // to include (true) or which to exclude (false), but not both.
  Meteor.publish('meetings', function () {
    return Meetings.find();
  });
}

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
    // meetingId is an ObjectID instead of a string when a meeting is
    // inserted directly into MongoDB using the "meteor mongo" shell.
    check(meetingId, Match.OneOf(String, Meteor.Collection.ObjectID));
    Meetings.remove(meetingId);
  },

  updateMeeting(meetingId, updates) {
    // meetingId is an ObjectID instead of a string when a meeting is
    // inserted directly into MongoDB using the "meteor mongo" shell.
    check(meetingId, Match.OneOf(String, Meteor.Collection.ObjectID));
    check(updates, Object);
    // $set updates only specified properties.
    Meetings.update(meetingId, {$set: updates});
  }
});
