<script>
  import {call, handleError} from './util.js';

  export let meeting;
  export let topicIndex;

  $: ({status: meetingStatus} = meeting);

  $: ({topics} = meeting);

  $: meetingStarted = topicIndex > -1;
  $: console.log('MeetingEditor.svelte x: meetingStarted =', meetingStarted);

  const updateMeeting = updates => call('updateMeeting', meeting._id, updates);

  async function updateProperty(event, property) {
    const {value} = event.target;

    try {
      await updateMeeting({[property]: value});
      meeting[property] = value;
    } catch (e) {
      handleError(e);
    }
  }
</script>

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

<style>
  div {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  #duration {
    width: 30px;
  }

  label {
    display: inline-block;
    margin-right: 0.5rem;
    text-align: right;
    width: 80px;
  }
</style>
