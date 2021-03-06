<script>
  import {
    MS_PER_SECOND,
    minutesToMs,
    SECONDS_PER_MINUTE,
    timeStringFromMs
  } from 'meteor/mvolkmann:date-time-utils';
  import {call, handleError, isActive} from './util.js';

  export let meeting;

  const NOT_STARTED_COLOR = 'white';
  const STARTED_COLOR = 'lightgreen';
  const WARNING_COLOR = 'yellow';
  const DANGER_COLOR = 'pink';
  const FINISHED_COLOR = 'lightgray';

  let buttonText = '';
  let editTopicIndex = -1;
  let topicEndMs = 0;
  let errorMessage = '';
  let haveTopics = false;
  let intervalId;
  let meetingStarted = false;
  let remainingMeetingMs = 0; // ms left in entire meeting
  let remainingTopicMs = 0; // ms left in current topic
  let remainingTopicsMinutes = 0; // minutes left in future topics
  let startMs = 0; // timestamp meeting started or last resumed
  let status = '';
  let topics = [];
  let totalMinutes = 0;
  let topicIndex = -1;

  $: setup(meeting);

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

  function advance() {
    setTopicColor(topicIndex, FINISHED_COLOR);
    clearInterval(intervalId);
    intervalId = 0;
    topicIndex++;
    remainingTopicMs = 0; // need to calculate for next topic
    nextTopic();
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

  function editTopic(index, event) {
    if (index === editTopicIndex) {
      stopEditing();
    } else {
      editTopicIndex = index;
      const id = event ? event.target.id : 'description' + index;
      setTimeout(() => document.getElementById(id).focus());
    }
  }

  function endMeeting() {
    clearInterval(intervalId);
    intervalId = 0;

    resetColors();

    status = 'ended';
    topicIndex = -1;
    updateMeeting({
      remainingMeetingMs: 0,
      remainingTopicMs: 0,
      startMs: 0,
      status
    });
  }

  const getRemainingTopicsMinutes = topicIndex =>
    topics.slice(topicIndex + 1).reduce((acc, topic) => acc + topic.minutes, 0);

  function handleKeypress(event) {
    if (event.key === 'Enter') addTopic();
  }

  function moveTopicDown(topic) {
    const index = topics.findIndex(t => t === topic);
    if (index < topics.length - 1) swapTopics(index, index + 1);
  }

  function moveTopicUp(topic) {
    const index = topics.findIndex(t => t === topic);
    if (index > 0) swapTopics(index - 1, index);
  }

  function nextTopic(inProgressMs) {
    if (inProgressMs) setRemainingTopicMs(inProgressMs);

    const topic = topics[topicIndex];
    if (!topic) {
      // no more topics in meeting
      endMeeting();
      return;
    }

    remainingTopicsMinutes = getRemainingTopicsMinutes(topicIndex);

    if (!remainingTopicMs) {
      const {minutes} = topic;
      if (minutes === undefined || typeof minutes !== 'number') {
        alert('Each topic must have a minutes property that is a number.');
        return;
      }

      setRemainingTopicMs(minutesToMs(minutes));
    }
    topicEndMs = Date.now() + remainingTopicMs;

    updateTopicColor(topicIndex);

    intervalId = setInterval(() => {
      if (status === 'paused') return;

      const nowMs = Date.now();
      if (nowMs >= topicEndMs) {
        advance();
      } else {
        setRemainingTopicMs(topicEndMs - nowMs);
        updateTopicColor(topicIndex);
      }
    }, MS_PER_SECOND);
  }

  function resetColors() {
    topics.forEach((_, index) => setTopicColor(index, NOT_STARTED_COLOR));
  }

  function setRemainingTopicMs(ms) {
    remainingTopicMs = ms;
    remainingMeetingMs = remainingTopicMs + minutesToMs(remainingTopicsMinutes);
  }

  function setTopicColor(index, color) {
    const tr = document.querySelector('.topic' + index);
    if (tr) tr.style.backgroundColor = color;
  }

  function setup(meeting) {
    ({remainingMeetingMs, remainingTopicMs, startMs, status, topics} = meeting);

    haveTopics = Boolean(topics.length);
    meetingStarted = isActive(meeting);
    totalMinutes = topics.reduce((acc, topic) => acc + topic.minutes, 0);
    errorMessage =
      totalMinutes > meeting.duration
        ? 'Topic minutes exceed meeting duration!'
        : '';

    // If the meeting has started, determine which topic we are on.
    if (meetingStarted) {
      // Determine how much time remains in the meeting
      // and how long the meeting has run so far.
      const totalMs = minutesToMs(totalMinutes);
      if (!remainingMeetingMs) {
        remainingMeetingMs = totalMs - (Date.now() - startMs);
      }
      let elapsedMs = totalMs - remainingMeetingMs;

      // Determine which topic the meeting has reached.
      topicIndex = 0;
      while (true) {
        const topic = topics[topicIndex];
        if (!topic) break;
        const topicMs = minutesToMs(topic.minutes);
        if (topicMs > elapsedMs) break;
        elapsedMs -= topicMs;
        topicIndex++;
      }
    } else if (status === 'ended') {
      resetColors();
    }

    remainingTopicsMinutes = getRemainingTopicsMinutes(topicIndex);
    const remainingTopicsMs = minutesToMs(remainingTopicsMinutes);
    remainingTopicMs = remainingMeetingMs - remainingTopicsMs;
    remainingMeetingMs = remainingTopicMs + minutesToMs(remainingTopicsMinutes);

    if (status === 'resumed') topicEndMs = Date.now() + remainingTopicMs;

    buttonText =
      topicIndex === -1
        ? 'Start Meeting'
        : status === 'paused'
        ? 'Resume Meeting'
        : 'Pause Meeting';

    // For clients that did not start the meeting ...
    if (isActive(meeting) && !intervalId) nextTopic(remainingTopicMs);
  }

  async function startMeeting() {
    stopEditing();
    status = 'started';

    try {
      topicIndex = 0;
      await updateMeeting({startMs: Date.now(), status});
    } catch (e) {
      handleError(e);
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

  function toggleMeeting() {
    if (meetingStarted) {
      // Determine if the meeting is currently paused.
      const paused = status === 'paused';

      // Determine the next status after toggling.
      status = paused ? 'resumed' : 'paused';

      let updates;

      if (paused) {
        // Prepare to resume.
        topicEndMs = Date.now() + remainingTopicMs;
        updates = {startMs: Date.now(), status};
      } else {
        // Prepare to pause.
        updates = {remainingMeetingMs, remainingTopicMs, status};
      }

      try {
        updateMeeting(updates);
      } catch (e) {
        handleError(e);
      }
    } else {
      startMeeting();
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
      remainingTopicMs > 120000 // two minutes
        ? STARTED_COLOR
        : remainingTopicMs > SECONDS_PER_MINUTE * MS_PER_SECOND // one minute
        ? WARNING_COLOR
        : DANGER_COLOR;
    setTopicColor(topicIndex, color);
  }
</script>

{#if haveTopics}
  <table>
    <caption>The meeting has {status}.</caption>
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
                id="description{index}"
                value={topic.description}
                on:input={e => updateTopic(e, index, 'description')} />
            </td>
            <td>
              <input
                id="presenter{index}"
                value={topic.presenter}
                on:input={e => updateTopic(e, index, 'presenter')} />
            </td>
            <td>
              <input
                id="minutes{index}"
                type="number"
                value={topic.minutes}
                on:input={e => updateTopic(e, index, 'minutes', true)}
                on:keypress={handleKeypress} />
            </td>
          {:else}
            <td
              id="description{index}"
              on:click={event => editTopic(index, event)}>
              {topic.description}
            </td>
            <td
              id="presenter{index}"
              on:click={event => editTopic(index, event)}>
              {topic.presenter}
            </td>
            <td
              id="minutes{index}"
              on:click={event => editTopic(index, event)}
              class="minutes">
              {topic.minutes}
            </td>
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
            <td class="time-remaining">{timeStringFromMs(remainingTopicMs)}</td>
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
    <button type="button" on:click={toggleMeeting}>{buttonText}</button>
  {/if}
  {#if meetingStarted}
    <button type="button" on:click={advance}>Advance</button>
    <button type="button" on:click={endMeeting}>End Meeting</button>
  {:else}
    <button on:click={addTopic}>Add Topic</button>
  {/if}
  <!-- <button on:click={close}>Close</button> -->
</div>

{#if meetingStarted}
  <div class="remaining">
    Time remaining in meeting - {formatTime(remainingMeetingMs)}
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
