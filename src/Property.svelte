<!--
  FF Typescript Foundation Library
  Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH

  License: MIT
-->

<script context="module" lang="typescript">
    import Property from "@ff/core/Property";
    import PropertyEdit from "./PropertyEdit.svelte";
</script>

<script lang="typescript">
    export let prop: Property = null;
</script>

<!-- MARKUP ------------------------------------------------------------------->

<template>
    <div class="ff-property flex">
        {#if prop}
        <div class="ff-property-label">{prop.name}</div>
        <PropertyEdit {prop} />
        {/if}
    </div>
</template>

<!-- STYLES ------------------------------------------------------------------->

<style type="text/css">
    .ff-property {
        @apply flex my-2;
    }
    .ff-property-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 50%;
    }
</style>