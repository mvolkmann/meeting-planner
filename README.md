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

- `npm run mup`

NOTE: Currently mup works with Node 12, but not Node 14!

To enable connections to MongoDB Atlas:

- browse cloud.mongodb.com
- sign in
- click "Network Access" in the left nav
- press the "ADD IP ADDRESS" button
- enter the IP address of a server that will connect to MongoDB Atlas
  (In my case this is the IP address of my DigitalOcean server.)
- press the "Confirm" button
