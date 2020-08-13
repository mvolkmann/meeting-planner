<script>
  import {createEventDispatcher} from 'svelte';

  export let meeting;
  export let selected;

  const dispatch = createEventDispatcher();

  $: ({date, name, time} = meeting);

  function deleteMeeting() {
    if (confirm('Are you sure you want to delete this meeting?')) {
      dispatch('delete', meeting);
    }
  }
</script>

<li class:selected on:click>
  <span class="name">{name}</span>
  on {date} at {time}
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
