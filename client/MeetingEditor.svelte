<script>
  //import {Mongo} from 'meteor/mongo';
  import {createEventDispatcher} from 'svelte';
  import {Meetings} from '../imports/meetings';

  export let meeting;

  const dispatch = createEventDispatcher();

  let editTopicIndex = -1;
  let endMsForTopic;
  let meetingStatus = 'not started';
  let paused = false;
  let remainingMsInTopic = 0;
  let topicIndex;

  let topics = [];
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
    topicIndex === undefined
      ? 'Start Meeting'
      : paused
      ? 'Resume Meeting'
      : 'Pause Meeting';

  $: meetingStarted = topicIndex !== undefined;

  function addTopic() {
    const minutes = Math.max(meeting.duration - totalMinutes, 0);
    const topic = {description: '', presenter: '', minutes};
    Meetings.update(meeting._id, {
      $set: {topics: [...topics, topic]}
    });
    topics.push(topic); //TODO: need?
    editTopic(topics.length - 1);
  }

  const close = () => dispatch('close');

  function deleteTopic(topic) {
    topics = topics.filter(t => t !== topic);
    Meetings.update(meeting._id, {$set: {topics}});
    stopEditing();
  }

  function editTopic(index) {
    if (index === editTopicIndex) {
      stopEditing();
    } else {
      editTopicIndex = index;
    }
  }

  function formatTime(remainingMsInTopic) {
    const seconds = Math.round(remainingMsInTopic / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes + ':' + (seconds % 60).toString().padStart(2, '0');
  }

  function handleSubmit() {
    // Do nothing.
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
      topicIndex = undefined;
      meetingStatus = 'ended';
      return;
    }

    const {minutes} = topic;
    if (!minutes || typeof minutes !== 'number') {
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

  function startOrPauseMeeting() {
    if (meetingStarted) {
      if (paused) endMsForTopic = Date.now() + remainingMsInTopic;
      paused = !paused;
      meetingStatus = paused ? 'been paused' : 'resumed';
    } else {
      stopEditing();
      meetingStatus = 'started';
      topicIndex = 0;
      nextTopic();
    }
  }

  function stopEditing() {
    editTopicIndex = -1;
  }

  function swapTopics(index1, index2) {
    stopEditing();
    [topics[index1], topics[index2]] = [topics[index2], topics[index1]];
    // $set updates only specified properties.
    Meetings.update({_id: meeting._id}, {$set: {topics}});
  }

  function updateProperty(event, property) {
    const {value} = event.target;
    // $set updates only specified properties.
    Meetings.update({_id: meeting._id}, {$set: {[property]: value}});
    meeting[property] = value;
  }

  function updateTopic(event, index, property, isNumber) {
    const {value} = event.target;
    topics[index][property] = isNumber ? Number(value) : value;
    // $set updates only specified properties.
    Meetings.update({_id: meeting._id}, {$set: {topics}});
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

<form on:submit|preventDefault={handleSubmit}>
  <div class="left-side">
    <div>
      <label for="name">Name</label>
      <input
        id="name"
        autofocus
        disabled={meetingStarted}
        size="30"
        value={meeting.name}
        on:input={e => updateProperty(e, 'name')} />
    </div>
    <div>
      <label for="date">Date</label>
      <input
        id="date"
        disabled={meetingStarted}
        type="date"
        value={meeting.date}
        on:input={e => updateProperty(e, 'date')} />
    </div>
    <div>
      <label for="time">Time</label>
      <input
        id="time"
        disabled={meetingStarted}
        type="time"
        value={meeting.time}
        on:input={e => updateProperty(e, 'time')} />
    </div>
    <div>
      <label for="time">Duration</label>
      <input
        id="duration"
        disabled={meetingStarted}
        type="number"
        value={meeting.duration}
        on:input={e => updateProperty(e, 'duration')} />
    </div>
  </div>
  <div class="right-side">
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
        <button type="button" on:click={startOrPauseMeeting}>
          {buttonText}
        </button>
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

  .buttons {
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
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

  #duration {
    width: 30px;
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

  form {
    display: flex;
    margin-top: 1rem;
    padding: 0.5rem;
    position: relative;
  }

  .hide {
    visibility: hidden;
  }

  label {
    display: inline-block;
    margin-right: 0.5rem;
    text-align: right;
    width: 80px;
  }

  .left-side {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .left-side > div {
    margin: 0.5rem 0;
  }

  .minutes {
    text-align: right;
  }

  .remaining {
    color: cornflowerblue;
    font-size: 1.2rem;
    margin-top: 0.5rem;
  }

  .right-side {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 1rem;
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
