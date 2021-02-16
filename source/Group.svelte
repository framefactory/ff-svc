<script context="module" lang="typescript">
    export type SelectEvent = CustomEvent<{ element: HTMLElement }>;
</script>

<script lang="typescript">
    import { beforeUpdate, createEventDispatcher } from "svelte";

    export let value = "";
    export let mode: "radio" | "exclusive" = "radio"
    let classes = "";
    export { classes as class };

    let groupElement: HTMLDivElement = null;

    const dispatch = createEventDispatcher();

    beforeUpdate(() => {
        if (groupElement) {
            groupElement.childNodes.forEach(child => {
                if (child instanceof HTMLElement) {
                    if (value && child["value"] === value) {
                        child.setAttribute("selected", "true");
                    }
                    else {
                        child.removeAttribute("selected");
                    }
                }
            });
        }
    });

    function onClick(event: MouseEvent) {
        const target = event.target;

        if (target instanceof HTMLElement) {
            this.childNodes.forEach(child => {
                if (child !== target && child instanceof HTMLElement) {
                    child.removeAttribute("selected");
                }
            });

            const isSelected = target.hasAttribute("selected");

            if (mode === "exclusive" && isSelected) {
                target.removeAttribute("selected");
                dispatch("select", { element: null });
            }
            else if (!isSelected)  {
                target.setAttribute("selected", "true");
                dispatch("select", { element: target });
            }

        }
    }
</script>

<!-- MARKUP ------------------------------------------------------------------->

<template>
    <div
        class={"group " + classes}
        bind:this={groupElement}
        on:click={onClick}
    >
        <slot/>
    </div>
</template>

<!-- STYLES ------------------------------------------------------------------->

<style type="text/css">
</style>