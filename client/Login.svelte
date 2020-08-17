<script>
  import {BlazeTemplate} from 'meteor/svelte:blaze-integration';
  import './accounts-config.js';
</script>

<BlazeTemplate template="loginButtons" />

<style>
  :global(#login-buttons) {
    position: fixed;
    top: 0.5rem;
    right: 0.5rem;

    padding: 0.5rem;
    text-align: right;
  }

  :global(#login-buttons #login-name-link),
  :global(#login-buttons #login-sign-in-link) {
    color: white;
    font-size: 1.5rem;
    text-decoration: none;
  }

  :global(#login-dropdown-list) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
