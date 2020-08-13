<script>
  // import {useTracker} from 'meteor/rdb:svelte-meteor-data';
  import Meeting from './Meeting.svelte';
  import MeetingEditor from './MeetingEditor.svelte';

  import {Meetings} from '../imports/meetings.js';

  let selectedMeeting = null;
  let selectedMeetingIndex = -1;

  const query = {};
  //const projection = {sort: {name: 1}}; // ascending alphabetical
  const projection = {}; // sorting breaks selectedMeetingIndex!
  // This is a MongoDB cursor which is also a Svelte store.
  $: meetings = Meetings.find(query, projection);
  $: selectedMeeting = $meetings[selectedMeetingIndex];

  function createMeeting() {
    selectedMeeting = {
      name: '',
      date: getDefaultDate(),
      time: getDefaultTime(),
      duration: 30,
      topics: []
    };
    selectedMeetingIndex = $meetings.length;
    //selectedMeetingIndex = 0; // will be first in list
    selectedMeeting._id = Meetings.insert(selectedMeeting);
  }

  function deleteMeeting(event) {
    const meeting = event.detail;
    Meetings.remove(meeting._id);
  }

  function editorClosed() {
    selectedMeeting = null;
    selectedMeetingIndex = -1;
  }

  function getDefaultDate() {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const date = now.getDate().toString().padStart(2, '0');
    return now.getFullYear() + '-' + month + '-' + date;
  }

  function getDefaultTime() {
    const now = new Date();
    const hours = (now.getHours() + 1).toString().padStart(2, '0');
    return hours + ':00';
  }

  function selectMeeting(index, meeting) {
    selectedMeetingIndex = index;
    selectedMeeting = meeting;
  }
</script>

<div class="container">
  <header>
    <h1>Meetings</h1>
  </header>
  <section>
    {#if selectedMeeting}
      <MeetingEditor meeting={selectedMeeting} on:close={editorClosed} />
    {:else}
      <button on:click={createMeeting}>New Meeting</button>
      <div class="title">Select a meeting.</div>
      <ul>
        {#each $meetings as meeting, index}
          <Meeting
            {meeting}
            on:click={() => selectMeeting(index, meeting)}
            on:delete={deleteMeeting}
            selected={index === selectedMeetingIndex} />
        {/each}
      </ul>
    {/if}
  </section>
</div>

<style>
  button {
    margin-top: 1rem;
  }

  .title {
    color: white;
    font-size: 1.2rem;
    margin-top: 1rem;
  }

  ul {
    background-color: white;
    list-style-type: none;
    padding: 0.5rem;
  }
</style>
