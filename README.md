# meeting-planner

This app supports planning and running meetings.
It stores information about users and meetings in MongoDB.
It uses Meteor to provide real-time UI updates to any number of logged in users.
The UI is built with Svelte.

To run the app:

- `npm install`
- `npm start`

To deploy the app to a DigitalOcean server
that uses MongoDB Atlas for the database:

- `cd .deploy`
- `mup setup`
- `mup deploy`
