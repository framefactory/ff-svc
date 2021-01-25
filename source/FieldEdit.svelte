<script context="module" lang="typescript">
    export type ChangeEvent = CustomEvent<{ value: any }>;
</script>

<script lang="typescript">
    import { createEventDispatcher } from "svelte";

    let classes = "";
    export { classes as class };

    export let value: number | boolean | string = 0;
    export let min = -Number.MAX_VALUE;
    export let max = Number.MAX_VALUE;
    export let precision = 2;
    export let step = 0.005;
    export let percent = false;
    export let bar = false;

    const dispatch = createEventDispatcher();

    let lastX = 0;
    let lastY = 0;
    let isDragging = false;

    function getText(value: any): string
    {
        dispatch("change", { value });

        if (type === "number") {
            if (percent) {
                const p = Math.max(0, precision - 2);
                return (value * 100).toFixed(p) + "%";
            }
            else {
                return value.toFixed(precision);
            }
        }
        else if (type === "boolean") {
            return value ? "true" : "false";
        }
        else {
            return value;
        }
    }

    function getRelative(value)
    {
        if (type !== "number") {
            return 0;
        }

        if (min > -Number.MAX_VALUE && max < Number.MAX_VALUE) {
            return (value - min) / (max - min);
        }
    }

    $: type = typeof value;
    $: text = getText(value);
    $: hasBar = bar && type === "number" && min > -Number.MAX_VALUE && max < Number.MAX_VALUE;
    $: barMargin = hasBar ? 100 - 100 * (value as number - min) / (max - min) : 0;

    function setValue(text: string)
    {
        if (type === "number") {
            const v = parseFloat(text) || value as number;
            value = Math.max(min, Math.min(max, v));
        }
        else if (type === "boolean") {
            const t = text.toLowerCase();
            value = t !== "" && t !== "false" && t !== "0";
        }
        else {
            value = text;
        }
    }

    function onPointerDown(event: PointerEvent)
    {
        if (!event.isPrimary) {
            return;
        }

        lastX = event.offsetX;
        lastY = event.offsetY;
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }

    function onPointerMove(event: PointerEvent)
    {
        if (type !== "number" || !event.isPrimary || !event.buttons) {
            return;
        }
        
        const x = event.offsetX;
        const y = event.offsetY;

        if (isDragging) {
            const dx = x - lastX;
            const dy = y - lastY;
            lastX = x;
            lastY = y;
            const delta = Math.abs(dx) > Math.abs(dy) ? dx : -dy;
            const f = step * (event.shiftKey ? 10 : (event.ctrlKey ? 0.1 : 1));
            value = Math.max(min, Math.min(max, value as number + delta * f));
        }
        else if (Math.abs(x - lastX) + Math.abs(y - lastY) > 2) {
            lastX = x;
            lastY = y;
            isDragging = true;
        }
    }

    function onPointerUp(event: PointerEvent)
    {
        if (event.isPrimary) {
            (event.target as HTMLElement).releasePointerCapture(event.pointerId);

            if (type === "boolean") {
                value = !value;
            }
        }
    }

</script>

<!-- MARKUP ------------------------------------------------------------------->

<template>
    <div
        class={"root field-edit " + classes}
        on:pointerdown={onPointerDown}
        on:pointermove={onPointerMove}
        on:pointerup={onPointerUp}
    >
        {#if hasBar}
            <div class="bar field-edit-bar" style="right: {barMargin}%"></div>
        {/if}
        <div class="text field-edit-text">{text}</div>
    </div>
</template>

<!-- STYLES ------------------------------------------------------------------->

<style type="text/css">
.root {
    position: relative;
    overflow: hidden;
    z-index: 0;
}
.bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: -1;
}
.text {
    text-align: right;
}
</style>