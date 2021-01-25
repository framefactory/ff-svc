<script context="module" lang="typescript">
</script>

<script lang="typescript">
    import { createEventDispatcher } from "svelte";
    import Icon from "./Icon.svelte";

    export let multiple: boolean = false;

    let fileInput: HTMLInputElement;
    const dispatch = createEventDispatcher();

    function onClick(event: MouseEvent) {
        fileInput.click();
    }

    function onDragEnter(event: DragEvent) {
        this.classList.add("dropmark");
    }

    function onDragLeave(event: DragEvent) {
        this.classList.remove("dropmark");
    }

    function onDragOver(event: DragEvent) {
        event.preventDefault();
    }

    function onDrop(event: DragEvent) {
        event.preventDefault();
        this.classList.remove("dropmark");
        const files = [ ...event.dataTransfer.items ].map(item => item.getAsFile());
        dispatch("files", { files });
    };

    function onChange() {
        const files = [ ...this.files ];
        dispatch("files", { files });
    }

</script>

<!-- MARKUP ------------------------------------------------------------------->

<template>
    <button
        on:click={onClick}
        on:dragenter={onDragEnter}
        on:dragleave={onDragLeave}
        on:dragover={onDragOver}
        on:drop={onDrop}
        class="button">
        <div class="border border-light-700 border-dashed p-4 pointer-events-none">
            <Icon name="file"/>
            <slot/>
        </div>
    </button>
    <input bind:this={fileInput} on:change={onChange} type="file" multiple={multiple} hidden/>
</template>

<!-- STYLES ------------------------------------------------------------------->

<style type="text/css">
    :global(button.dropmark) div {
        @apply border-light-300;
    }
</style>