<!--
  FF Typescript Foundation Library
  Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH

  License: MIT
-->

<script context="module" lang="typescript">
</script>

<script lang="typescript">
    import Icon from "./Icon.svelte";
    export let search: string = "";

    function onClickClear()
    {
        search = "";
    }
</script>

<!-- MARKUP ------------------------------------------------------------------->

<template>
    <div class="search widget flex items-center">
        <input type="text" placeholder="Search..." bind:value={search} />
        <span class="cursor-pointer pt-1" on:click={onClickClear}><Icon name="close"/></span>
    </div>
</template>

<!-- STYLES ------------------------------------------------------------------->

<style type="text/css">
    input, input:focus {
        @apply bg-transparent w-full
    }
</style>