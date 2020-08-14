<script>
  import {Meteor} from 'meteor/meteor';
  import {useTracker} from 'meteor/rdb:svelte-meteor-data';
  import {onMount} from 'svelte';
  import Login from './Login.svelte';
  import MeetingDetail from './MeetingDetail.svelte';
  import MeetingList from './MeetingList.svelte';
  import {Meetings} from '../imports/meetings.js';
  import {call, handleError} from './util.js';

  let selectedMeeting = null;
  let selectedMeetingIndex = -1;

  onMount(() => Meteor.subscribe('meetings'));

  // user is a store
  $: user = useTracker(() => Meteor.user());
  $: emailVerified = $user && $user.emails[0].verified;

  const query = {};
  //const projection = {sort: {name: 1}}; // ascending alphabetical
  const projection = {}; // sorting breaks selectedMeetingIndex!
  // This is a MongoDB cursor which is also a Svelte store.
  $: meetings = Meetings.find(query, projection);
  $: selectedMeeting = $meetings[selectedMeetingIndex];

  async function createMeeting() {
    try {
      const nextIndex = $meetings.length;
      selectedMeeting = await call('createMeeting');
      selectedMeetingIndex = nextIndex;
    } catch (e) {
      handleError(e);
    }
  }

  function editorClosed() {
    selectedMeeting = null;
    selectedMeetingIndex = -1;
  }
</script>

<div class="container">
  <Login />
  <header>
    <h1>Meeting Planner</h1>
  </header>
  <section>
    {#if !$user}
      <p>Please sign in.</p>
    {:else if !emailVerified}
      <p>
        You have been sent an email containing a link to verify your account.
        Please click that link in order to begin using this app.
      </p>
    {:else if selectedMeeting}
      <MeetingDetail meeting={selectedMeeting} on:close={editorClosed} />
    {:else}
      <button on:click={createMeeting}>New Meeting</button>
      <MeetingList bind:selectedMeetingIndex />
    {/if}
  </section>
</div>

<style>
  button {
    margin-top: 1rem;
  }

  p {
    color: white;
  }
</style>
