<script>
  import {call, handleError} from './util.js';

  export let meeting;
  export let topicIndex;

  let editTopicIndex = -1;
  let endMsForTopic;
  let remainingMsInTopic = 0;

  $: ({status: meetingStatus} = meeting);
  $: paused = meetingStatus === 'paused';
  $: if (meetingStatus === 'resumed') {
    endMsForTopic = Date.now() + remainingMsInTopic;
  }

  $: if (meetingStatus === 'started' && topicIndex === -1) startMeeting();

  $: ({topics} = meeting);

  $: haveTopics = Boolean(topics.length);

  $: totalMinutes = topics.reduce((acc, topic) => acc + topic.minutes, 0);

  $: minutesInRemainingTopics = topics
    .slice(topicIndex + 1)
    .reduce((acc, topic) => acc + topic.minutes, 0);

  $: remainingMsInMeeting =
    remainingMsInTopic + 60 * 1000 * minutesInRemainingTopics;

  $: errorMessage =
    totalMinutes > meeting.duration
      ? 'Topic minutes exceed meeting duration!'
      : '';

  $: buttonText =
    topicIndex === -1
      ? 'Start Meeting'
      : paused
      ? 'Resume Meeting'
      : 'Pause Meeting';

  $: meetingStarted = topicIndex > -1;

  async function addTopic() {
    const minutes = Math.max(meeting.duration - totalMinutes, 0);
    const topic = {description: '', presenter: '', minutes};
    try {
      const nextIndex = topics.length;
      await updateMeeting({topics: [...topics, topic]});
      editTopic(nextIndex);
    } catch (e) {
      handleError(e);
    }
  }

  async function deleteTopic(topic) {
    topics = topics.filter(t => t !== topic);
    try {
      await updateMeeting({topics});
      stopEditing();
    } catch (e) {
      handleError(e);
    }
  }

  function editTopic(index) {
    if (index === editTopicIndex) {
      stopEditing();
    } else {
      editTopicIndex = index;
    }
  }

  function formatTime(ms) {
    const seconds = Math.round(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes + ':' + (seconds % 60).toString().padStart(2, '0');
  }

  function moveTopicDown(topic) {
    const index = topics.findIndex(t => t === topic);
    if (index < topics.length - 1) swapTopics(index, index + 1);
  }

  function moveTopicUp(topic) {
    const index = topics.findIndex(t => t === topic);
    if (index > 0) swapTopics(index - 1, index);
  }

  function nextTopic() {
    const topic = topics[topicIndex];
    if (!topic) {
      topicIndex = -1;
      meetingStatus = 'ended';
      return;
    }

    const {minutes} = topic;
    if (minutes === undefined || typeof minutes !== 'number') {
      alert('Each topic must have a minutes property that is a number.');
      return;
    }

    remainingMsInTopic = minutes * 60 * 1000;
    endMsForTopic = Date.now() + remainingMsInTopic;
    updateTopicColor(topicIndex);

    const token = setInterval(() => {
      if (paused) return;

      const nowMs = Date.now();
      if (nowMs >= endMsForTopic) {
        setTopicColor(topicIndex, 'lightgray');
        clearInterval(token);
        topicIndex++;
        nextTopic();
      } else {
        remainingMsInTopic = endMsForTopic - nowMs;
        updateTopicColor(topicIndex);
      }
    }, 1000);
  }

  function setTopicColor(index, color) {
    const tr = document.querySelector('.topic' + index);
    if (tr) tr.style.backgroundColor = color;
  }

  async function startMeeting() {
    stopEditing();
    meetingStatus = 'started';

    try {
      await updateMeeting({status: meetingStatus});
      topicIndex = 0;
      nextTopic();
    } catch (e) {
      handleError(e);
    }
  }

  function startOrPauseMeeting() {
    if (meetingStarted) {
      if (paused) {
        // Prepare to resume.
        endMsForTopic = Date.now() + remainingMsInTopic;
      }

      meetingStatus = paused ? 'resumed' : 'paused';

      try {
        updateMeeting({status: meetingStatus});
      } catch (e) {
        handleError(e);
      }
    } else {
      startMeeting();
    }
  }

  function stopEditing() {
    editTopicIndex = -1;
  }

  function swapTopics(index1, index2) {
    stopEditing();

    [topics[index1], topics[index2]] = [topics[index2], topics[index1]];

    try {
      updateMeeting({topics});
    } catch (e) {
      handleError(e);
    }
  }

  const updateMeeting = updates => call('updateMeeting', meeting._id, updates);

  function updateTopic(event, index, property, isNumber) {
    const {value} = event.target;
    topics[index][property] = isNumber ? Number(value) : value;

    try {
      updateMeeting({topics});
    } catch (e) {
      handleError(e);
    }
  }

  function updateTopicColor() {
    const color =
      remainingMsInTopic > 120000 // two minutes
        ? 'lightgreen'
        : remainingMsInTopic > 60000 // one minute
        ? 'yellow'
        : 'pink';
    setTopicColor(topicIndex, color);
  }
</script>

{#if haveTopics}
  <table>
    <caption>The meeting has {meetingStatus}.</caption>
    <thead>
      <tr>
        <th>Topic</th>
        <th>Presenter</th>
        <th>Minutes</th>

        {#if meetingStarted}
          <th>Time Remaining</th>
        {:else}
          <th>Edit</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each topics as topic, index}
        <tr class={'topic' + index}>
          {#if index === editTopicIndex}
            <td>
              <input
                autofocus
                value={topic.description}
                on:input={e => updateTopic(e, index, 'description')} />
            </td>
            <td>
              <input
                value={topic.presenter}
                on:input={e => updateTopic(e, index, 'presenter')} />
            </td>
            <td>
              <input
                type="number"
                value={topic.minutes}
                on:input={e => updateTopic(e, index, 'minutes', true)} />
            </td>
          {:else}
            <td>{topic.description}</td>
            <td>{topic.presenter}</td>
            <td class="minutes">{topic.minutes}</td>
          {/if}
          {#if !meetingStarted}
            <td class="edit">
              <button on:click={() => editTopic(index)}>&#x270E;</button>
              <button on:click={() => deleteTopic(topic)}>&#x1f5d1;</button>
              <button
                class:hide={index === topics.length - 1}
                on:click={() => moveTopicDown(topic)}>
                &#9660;
              </button>
              <button
                class:hide={index === 0}
                on:click={() => moveTopicUp(topic)}>
                &#9650;
              </button>
            </td>
          {/if}
          {#if topicIndex === index}
            <td class="time-remaining">{formatTime(remainingMsInTopic)}</td>
          {:else if meetingStarted}
            <td />
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<div class="error">{errorMessage}</div>

<div class="buttons">
  {#if haveTopics}
    <button type="button" on:click={startOrPauseMeeting}>{buttonText}</button>
  {/if}
  {#if !meetingStarted}
    <button on:click={addTopic}>Add Topic</button>
  {/if}
  <!-- <button on:click={close}>Close</button> -->
</div>

{#if meetingStarted}
  <div class="remaining">
    Time remaining in meeting - {formatTime(remainingMsInMeeting)}
  </div>
{/if}

<style>
  button {
    align-self: center;
    background-color: cornflowerblue;
    color: white;
    font-size: 1rem;
    margin: 0 0.5rem;
  }

  .buttons {
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
  }

  div {
    font-size: 1rem;
  }

  .edit > button {
    background: none;
    color: black;
    cursor: pointer;
    margin: 0;
  }

  .error {
    color: red;
  }

  .hide {
    visibility: hidden;
  }

  .minutes {
    text-align: right;
  }

  .remaining {
    color: cornflowerblue;
    font-size: 1.2rem;
    margin-top: 0.5rem;
  }

  table {
    margin-bottom: 0.5rem;
  }

  table > caption {
    color: cornflowerblue;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  td {
    width: 160px;
  }

  .time-remaining {
    font-feature-settings: 'tnum';
    font-variant-numeric: tabular-nums;
    text-align: center;
  }

  tr {
    height: 44px;
  }
</style>
