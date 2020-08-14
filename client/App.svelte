<script>
  import {onMount} from 'svelte';
  import Meeting from './Meeting.svelte';
  import MeetingEditor from './MeetingEditor.svelte';
  import {Meetings} from '../imports/meetings.js';
  import {call, handleError} from './util.js';

  let selectedMeeting = null;
  let selectedMeetingIndex = -1;

  onMount(() => Meteor.subscribe('meetings'));

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

  function deleteMeeting(meetingId) {
    try {
      call('deleteMeeting', meetingId);
    } catch (e) {
      handleError(e);
    }
  }

  function editorClosed() {
    selectedMeeting = null;
    selectedMeetingIndex = -1;
  }

  function selectMeeting(index, meeting) {
    selectedMeetingIndex = index;
    selectedMeeting = meeting;
  }
</script>

<div class="container">
  <header>
    <h1>Meeting Planner</h1>
  </header>
  <section>
    {#if selectedMeeting}
      <MeetingEditor meeting={selectedMeeting} on:close={editorClosed} />
    {:else}
      <button on:click={createMeeting}>New Meeting</button>
      {#if $meetings.length}
        <div class="title">Select a meeting.</div>
        <ul>
          {#each $meetings as meeting, index}
            <Meeting
              {meeting}
              on:click={() => selectMeeting(index, meeting)}
              on:delete={() => deleteMeeting(meeting._id)}
              selected={index === selectedMeetingIndex} />
          {/each}
        </ul>
      {/if}
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
