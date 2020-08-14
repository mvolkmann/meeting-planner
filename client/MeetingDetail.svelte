<script>
  import {createEventDispatcher} from 'svelte';
  import MeetingEditor from './MeetingEditor.svelte';
  import TopicEditor from './TopicEditor.svelte';

  export let meeting;

  const dispatch = createEventDispatcher();

  let topicIndex = -1;

  const close = () => dispatch('close');

  function handleSubmit() {
    // Do nothing.
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <div class="left-side">
    <MeetingEditor {meeting} bind:topicIndex />
  </div>
  <div class="right-side">
    <TopicEditor {meeting} bind:topicIndex />
  </div>
  <button class="close" on:click={close}>&#x2716;</button>
</form>

<style>
  button {
    align-self: center;
    background-color: cornflowerblue;
    color: white;
    font-size: 1rem;
    margin: 0 0.5rem;
  }

  .close {
    position: absolute;
    top: 0;
    right: 0;

    background-color: transparent;
    color: black;
    font-size: 2rem;
    margin-top: 0;
  }

  div {
    font-size: 1rem;
  }

  form {
    display: flex;
    margin-top: 1rem;
    padding: 1rem;
    position: relative;
  }

  .left-side {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .right-side {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 1rem;
  }
</style>
