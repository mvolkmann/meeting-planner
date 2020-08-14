<script>
  import {createEventDispatcher} from 'svelte';

  export let meeting;
  export let selected = false;

  const dispatch = createEventDispatcher();

  $: ({date, name, time} = meeting);

  function deleteMeeting() {
    if (confirm('Are you sure you want to delete this meeting?')) {
      dispatch('delete');
    }
  }

  function formatTime() {
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    const afterNoon = hours > 12;
    if (afterNoon) hours -= 12;
    const amPm = afterNoon ? 'PM' : 'AM';
    return `${hours}:${minutes} ${amPm}`;
  }
</script>

<li class:selected on:click>
  <span class="name">{name}</span>
  {#if date}on {date} at {formatTime(time)}{/if}
  <button on:click|stopPropagation={deleteMeeting}>&#x1f5d1;</button>
</li>

<style>
  button {
    background-color: transparent;
  }

  li {
    cursor: pointer;
    padding: 0.5rem 0;
  }

  li:not(:last-of-type) {
    border-bottom: solid cornflowerblue 1px;
  }

  .name {
    font-size: 1.5rem;
  }

  .selected {
    color: green;
  }
</style>
