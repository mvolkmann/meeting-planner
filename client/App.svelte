<script>
  import Meeting from './Meeting.svelte';
  import MeetingEditor from './MeetingEditor.svelte';

  $: meetings = [
    {
      _id: 'ah1',
      name: 'All Hands',
      date: '2020-08-13',
      time: '11:30',
      duration: 30,
      topics: [
        {description: 'Welcome', presenter: 'Gina', minutes: 5},
        {
          description: 'Strategy Update',
          presenter: 'Bob',
          minutes: 15
        },
        {
          description: 'Day in the Life',
          presenter: 'Nicki',
          minutes: 5
        },
        {description: 'Kudos', presenter: 'Michael', minutes: 5}
      ]
    },
    {
      _id: 'tl1',
      name: 'Tech Lunch',
      date: '2020-08-28',
      time: '11:30',
      duration: 60,
      topics: [
        {description: 'Welcome', presenter: 'Adam', minutes: 3},
        {
          description: 'Intro. to Meteor',
          presenter: 'Mark',
          minutes: 1
        }
      ]
    }
  ];

  let selectedMeeting;
  $: if (selectedMeeting) meetings = meetings; // trigger reactivity

  function createMeeting() {
    selectedMeeting = {
      _id: 'm' + meetings.length,
      name: '',
      date: getDefaultDate(),
      time: getDefaultTime(),
      duration: 30,
      topics: []
    };
    meetings.push(selectedMeeting);
    meetings = meetings; // trigger reactivity
  }

  function deleteMeeting(event) {
    const meeting = event.detail;
    meetings = meetings.filter(m => m !== meeting);
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
</script>

<div class="container">
  <header>
    <h1>Meetings</h1>
  </header>
  <section>
    {#if selectedMeeting}
      <MeetingEditor
        bind:meeting={selectedMeeting}
        on:close={() => (selectedMeeting = undefined)} />
    {:else}
      <button on:click={createMeeting}>New Meeting</button>
      <div class="title">Select a meeting.</div>
      <ul>
        {#each meetings as meeting}
          <Meeting
            bind:meeting
            selected={meeting === selectedMeeting}
            on:click={() => (selectedMeeting = meeting)}
            on:delete={deleteMeeting} />
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
