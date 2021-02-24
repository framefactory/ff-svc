<script context="module" lang="typescript">
    import { onDestroy, onMount, afterUpdate } from "svelte";

    import math from "@ff/core/math";
    import Color from "@ff/core/Color";
    import Property, { IPropertyChangeEvent } from "@ff/core/Property";
    import DragTarget from "@ff/browser/DragTarget";
</script>

<script lang="typescript">
import { schemas } from "@ff/core/Property";

    export let prop: Property = null;
    export let index = -1;

    const helper = new DragTarget();

    $: schema = prop.schema;
    $: text = valueToText();
    $: barPercent = valueToBarPercent();
    $: showBar = schema.bar && schema.min !== undefined && schema.max !== undefined;

    let isEditing = false;
    let startValue = 0;
    let rootElement: HTMLDivElement = null;
    let inputElement: HTMLInputElement = null;

    function getValue()
    {
        return index >= 0 && prop.isArray() ? prop.value[index] : prop.value;
    }

    function setValue(value: any) {
        if (index >= 0 && prop.isArray()) {
            prop.value[index] = value;
            prop.set();
        }
        else {
            prop.setValue(value);
        }
    }

    function valueToText()
    {
        if (!prop) {
            return "";
        }

        const schema = prop.schema;

        if (schema.semantic === "color") {
            return Color.fromArray(prop.value as number[]).toString();
        }
        else if (schema.options) {
            return prop.getOption();
        }

        const value = getValue();

        switch(prop.type) {                    
            case "boolean":
                return value ? "Yes" : "No";
            case "number":
                const precision = isEditing ? 4 : schema.precision ?? 2;
                if (schema.percent && !isEditing) {
                    return (value as number * 100).toFixed(Math.max(0, precision - 2)) + "%";
                }
                return (value as number).toFixed(precision);
            case "string":
                return value as string;
        }
    }

    function valueToBarPercent()
    {
        if (!prop || prop.type !== "number") {
            return 100;
        } 

        const schema = prop.schema;
        if (!schema.bar || schema.min === undefined || schema.max === undefined) {
            return 100;
        }

        const value = getValue();
        return math.scaleLimit(value, schema.min, schema.max, 100, 0);
    }

    function textToValue(text: string)
    {
        let value = undefined;

        switch(prop.type) {
            case "number":
                let v = Number.parseFloat(text);
                if (!Number.isFinite(v)) {
                    v = prop.isArray() ? schema.preset[index] : schema.preset;
                }
                value = constrainNumber(v);
                break;
            case "string":
                value = text;
                break;
        }

        setValue(value);
    }

    function constrainNumber(value: number)
    {
        const min = schema.min ?? -Number.MAX_VALUE;
        const max = schema.max ?? Number.MAX_VALUE;
        const f = 10 ** (schema.precision ?? 2);
        return math.limit(Math.round(value * f) / f, min, max);
    }
    
    function onPropertyChange(event: IPropertyChangeEvent)
    {
        text = valueToText();
        barPercent = valueToBarPercent();
    }

    helper.onClick = function(event: PointerEvent)
    {
        if (isEditing) {
            return;
        }

        if (prop.type === "boolean") {
            setValue(!prop.value);
        }
        else if (schema.semantic === "color") {
            // TODO: show color picker
        }
        else {
            isEditing = true;
            helper.isEnabled = false;
        }
    }

    helper.onDragStart = () => {
        startValue = getValue();
    }

    helper.onDragMove = (event: PointerEvent) => {
        const dx = event.clientX - helper.startX;
        const dy = event.clientY - helper.startY;
        const f = (schema.speed ?? 0.005) * (event.shiftKey ? 10 : (event.ctrlKey ? 0.1 : 1));
        const v = startValue + Math.round(dx - dy) * f
        setValue(constrainNumber(v));
    };

    function onColorInput(event: InputEvent)
    {
        event.stopPropagation();

        const target = event.target as HTMLInputElement;
        const color = Color.fromString(target.value);
        color.toRGBArray(prop.value as number[]);
        prop.set();
    }

    function commitOption(event: MouseEvent)
    {
        stopEdit(event);

        const option = (event.target as HTMLLIElement).innerText;
        const index = schema.options.indexOf(option);
        if (index >= 0) {
            setValue(index);
        }
    }

    function stopEdit(event: Event)
    {
        isEditing = false;
        helper.isEnabled = true;
        event.stopPropagation();
    }

    function commitText(event: Event)
    {
        stopEdit(event);
        textToValue(inputElement.value);
    }

    function onKeydown(event: KeyboardEvent)
    {
        if (event.key === "Enter") {
            commitText(event);
        }
        else if (event.key === "Escape") {
            stopEdit(event);
        }
    }

    onMount(() => {
        if (prop && prop.schema.semantic !== "color") {
            helper.bind(rootElement);
        }

        prop.on("change", onPropertyChange);
    });

    onDestroy(() => {
        prop.off("change", onPropertyChange);
        helper.unbind();
    });

    afterUpdate(() => {
        if (isEditing && inputElement && inputElement !== document.activeElement) {
            inputElement.focus();
            inputElement.select();
        }
    })

    if (prop) {
        helper.dragEnabled = prop.type === "number"
            && !prop.schema.options
            && prop.schema.semantic !== "color";
        
        text = valueToText();
    }

</script>

<!-- MARKUP ------------------------------------------------------------------->

<template>
    <div class="ff-property-field" bind:this={rootElement}>
        {#if schema.semantic === "color"}
            <input type="color"
                value={Color.fromArray(prop.value).toString()}
                on:input={onColorInput}
            />
        {:else}
            <div class="ff-property-field-background">
                {#if showBar}
                    <div class="ff-property-field-bar"
                        style="right:{barPercent}%"
                    ></div>
                {/if}
                <div class="ff-property-field-text">{text}</div>
                {#if isEditing && !schema.options}
                    <input type="text" value={valueToText()}
                        on:blur={e => isEditing && commitText(e)}
                        on:keydown={onKeydown}
                        bind:this={inputElement}
                    />
                {/if}
            </div>
            {#if isEditing && schema.options}
                <div class="modal-plane"
                    on:click={stopEdit}>
                </div>
                <ul on:click={commitOption}>
                    {#each schema.options as option}
                        <li>{option}</li>
                    {/each}
                </ul>
            {/if}
        {/if}
    </div>
</template>

<!-- STYLES ------------------------------------------------------------------->

<style type="text/css">
    .ff-property-field {
        flex: 1 1 auto;
        position: relative;
    }
    .ff-property-field-background {
        position: absolute;
        top: 0; right: 0; bottom: 0; left: 0;
        z-index: 0;
        overflow: hidden;
        cursor: pointer;
        @apply rounded bg-color-back;
    }
    .ff-property-field-bar {
        position: absolute;
        z-index: 1;
        bottom: 0; left: 0;
        height: 3px;
        @apply bg-color-widget-selected;
    }
    .ff-property-field-text {
        position: absolute;
        top: 0; right: 0; bottom: 0; left: 0;
        z-index: 2;
        padding: 0 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;        
        text-align: right;
    }
    input, input:focus {
        position: absolute;
        z-index: 3;
        top: 0;
        width: 100%;
        padding: 0 4px;
        border: none;
        text-align: right;
        @apply rounded bg-color-frame-low;
    }
    .modal-plane {
        position: fixed;
        top: 0; right: 0; bottom: 0; left: 0;
        z-index: 10;
    }
    ul {
        position: absolute;
        z-index: 11;
        top: 100%;
        right: 0;
        min-width: 100%;
        cursor: pointer;
        user-select: none;
        @apply bg-color-widget;
    }
    li {
        @apply p-1 text-right;
    }
    li:hover {
        @apply bg-color-widget-selected;
    }
</style>