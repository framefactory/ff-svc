<!--
  FF Typescript Foundation Library
  Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH

  License: MIT
-->

<script context="module" lang="typescript">
</script>

<script lang="typescript">
    import Property from "@ff/core/Property";

    export let property: Property = null;
</script>

<!-- MARKUP ------------------------------------------------------------------->

<template>
    <div>
        <div>{property.name}</div>
        <div>{property.value}</div>
    </div>
</template>

<!-- STYLES ------------------------------------------------------------------->

<style type="text/css">
</style>