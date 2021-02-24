<script context="module" lang="typescript">
    import { onDestroy, onMount, afterUpdate } from "svelte";

    import math from "@ff/core/math";
    import Color from "@ff/core/Color";
    import Property, { IPropertyChangeEvent } from "@ff/core/Property";
    import DragTarget from "@ff/browser/DragTarget";
</script>

<script lang="typescript">
    export let prop: Property = null;
    export let index = -1;

    const helper = new DragTarget();

    $: schema = prop.schema;
    $: text = valueToText();
    $: showBar = schema.bar && schema.min !== undefined && schema.max !== undefined;

    let isEditing = false;
    let rootElement: HTMLDivElement = null;
    let inputElement: HTMLInputElement = null;

    const getValue = function()
    {
        return index >= 0 && prop.isArray ? prop.value[index] : prop.value;
    }

    const setValue = function(value: any) {
        if (index >= 0 && prop.isArray) {
            prop.value[index] = value;
            prop.set();
        }
        else {
            prop.setValue(value);
        }
    }

    const valueToText = function()
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
                    return (value as number * 100).toFixed(precision) + "%";
                }
                return (value as number).toFixed(precision);
            case "string":
                return value as string;
        }
    }

    const textToValue = function(text: string)
    {
        let value = undefined;

        switch(prop.type) {
            case "number":
                let v = Number.parseFloat(text);
                if (!Number.isFinite(v)) {
                    v = prop.isArray ? schema.preset[index] : schema.preset;
                }
                value = constrainNumber(v);
                break;
            case "string":
                value = text;
                break;
        }

        setValue(value);
    }

    const constrainNumber = function(value: number)
    {
        const min = schema.min ?? -Number.MAX_VALUE;
        const max = schema.max ?? Number.MAX_VALUE;
        const f = 10 ** (schema.precision ?? 2);
        return math.limit(Math.round(value * f) / f, min, max);
    }
    
    const onPropertyChange = function(event: IPropertyChangeEvent)
    {
        text = valueToText();
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

    helper.onDragMove = (event: PointerEvent, dx: number, dy: number) => {
        const f = (schema.speed ?? 0.1) * (event.shiftKey ? 10 : (event.ctrlKey ? 0.1 : 1));
        const v = getValue() + Math.round(dx - dy) * f;
        setValue(constrainNumber(v));
    };

    const onColorInput = function(event: InputEvent)
    {
        event.stopPropagation();

        const target = event.target as HTMLInputElement;
        const color = Color.fromString(target.value);
        color.toRGBArray(prop.value as number[]);
        prop.set();
    }

    const commitOption = function(event: MouseEvent)
    {
        stopEdit(event);

        const option = (event.target as HTMLLIElement).innerText;
        const index = schema.options.indexOf(option);
        if (index >= 0) {
            setValue(index);
        }
    }

    const stopEdit = function(event: Event)
    {
        isEditing = false;
        helper.isEnabled = true;
        event.stopPropagation();
    }

    const commitText = function(event: Event)
    {
        stopEdit(event);
        textToValue(inputElement.value);
    }

    const onKeydown = function(event: KeyboardEvent)
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
            {#if showBar}
                <div class="ff-property-field-bar"></div>
            {/if}
            <div class="ff-property-field-text">{text}</div>
            {#if isEditing === true}
                {#if schema.options}
                    <div class="modal-plane"
                        on:click={stopEdit}>
                    </div>
                    <ul on:click={commitOption}>
                        {#each schema.options as option}
                            <li>{option}</li>
                        {/each}
                    </ul>
                {:else}
                    <input type="text" value={valueToText()}
                        on:blur={e => isEditing && commitText(e)}
                        on:keydown={onKeydown}
                        bind:this={inputElement}
                    />
                {/if}
            {/if}
        {/if}
    </div>
</template>

<!-- STYLES ------------------------------------------------------------------->

<style type="text/css">
    .ff-property-field {
        flex: 1 1 auto;
        position: relative;
        cursor: pointer;
        @apply bg-color-back;
    }
    .ff-property-field-bar {
        @apply absolute bg-color-widget;
    }
    .ff-property-field-text {
        padding: 0 2px;        
        text-align: right;
        max-width: 100%;
    }
    input {
        position: absolute;
        top: 0;
        width: 100%;
        padding: 0 2px;
        border: none;
        @apply bg-color-frame-low;
    }
    .modal-plane {
        position: fixed;
        top: 0; right: 0; bottom: 0; left: 0;
    }
    ul {
        position: absolute;
        z-index: 1;
        top: 100%;
        right: 0;
        min-width: 100%;
        @apply bg-color-widget;
    }
    li {
        @apply p-1 text-right;
    }
    li:hover {
        @apply bg-color-widget-selected;
    }
</style>