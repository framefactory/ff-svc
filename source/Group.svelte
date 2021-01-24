<script context="module" lang="typescript">
    export type SelectEvent = CustomEvent<{ element: HTMLElement }>;
</script>

<script lang="typescript">
    import { createEventDispatcher } from "svelte";

    let classes = "";
    export { classes as class };
    export let mode: "radio" | "exclusive" = "radio"

    const dispatch = createEventDispatcher();

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
    <div on:click={onClick} class={"group " + classes}>
        <slot/>
    </div>
</template>

<!-- STYLES ------------------------------------------------------------------->

<style type="text/css">
</style>