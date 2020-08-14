<script>
  import {Meteor} from 'meteor/meteor';
  import {onMount} from 'svelte';
  import Meeting from './Meeting.svelte';
  import {Meetings} from '../imports/meetings.js';
  import {call, handleError} from './util.js';

  export let selectedMeetingIndex;

  onMount(() => Meteor.subscribe('meetings'));

  const query = {};
  //const projection = {sort: {name: 1}}; // ascending alphabetical
  const projection = {}; // sorting breaks selectedMeetingIndex!
  // This is a MongoDB cursor which is also a Svelte store.
  $: meetings = Meetings.find(query, projection);

  function deleteMeeting(meetingId) {
    try {
      call('deleteMeeting', meetingId);
    } catch (e) {
      handleError(e);
    }
  }
</script>

{#if $meetings.length}
  <div class="title">Select a meeting.</div>
  <ul>
    {#each $meetings as meeting, index}
      <Meeting
        {meeting}
        on:click={() => (selectedMeetingIndex = index)}
        on:delete={() => deleteMeeting(meeting._id)}
        selected={index === selectedMeetingIndex} />
    {/each}
  </ul>
{/if}

<style>
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
