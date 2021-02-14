<script context="module" lang="typescript">
    export type SliderDirection = "horizontal" | "vertical";
</script>

<script lang="typescript">
    import { onMount, createEventDispatcher } from "svelte";
    import math from "@ff/core/math";
    import DragTarget from "@ff/browser/DragTarget";

    export let value = 0;
    export let direction: SliderDirection = "horizontal";

    const _helper = new DragTarget();
    const _dispatch = createEventDispatcher();
    let _eSlider: HTMLDivElement = null;
    let _eKnob: HTMLDivElement = null;

    let _isVertical = direction === "vertical";
    let _offsetX = 0;
    let _offsetY = 0;
    let _knobTop = 0;
    let _knobLeft = 0;

    $: {
        if (_eSlider) {
            if (_isVertical) {
                const height = _eSlider.clientHeight - _eKnob.clientHeight;
                _knobTop = (1 - value) * height;
            }
            else {
                const width = _eSlider.clientWidth - _eKnob.clientWidth;
                _knobLeft = value * width;
            }
        }
    }

    onMount(() => {
        _helper.bind(_eSlider);
        return () => { _helper.unbind(_eSlider) }
    });

    _helper.onDragStart = (event: PointerEvent) => {
        const track = _eSlider.getBoundingClientRect();

        if (event.target === _eKnob) {
            _offsetX = event.clientX - _eKnob.offsetLeft + (_eKnob.clientWidth - _eKnob.offsetWidth) * 0.5;
            _offsetY = event.clientY - _eKnob.offsetTop + (_eKnob.clientHeight - _eKnob.offsetHeight) * 0.5;
        }
        else {
            _offsetX = track.left + _eKnob.clientWidth * 0.75;
            _offsetY = track.top + _eKnob.clientHeight * 0.75;
        }

        _helper.onDragMove(event, 0, 0);
    };

    _helper.onDragMove = (event: PointerEvent) => {
        const px = event.clientX - _offsetX;
        const py = event.clientY - _offsetY;

        let v = _isVertical
            ? 1 - py / (_eSlider.clientHeight - _eKnob.clientHeight)
            : px / (_eSlider.clientWidth - _eKnob.clientWidth);

        v = math.limit(v, 0, 1);

        if (v !== value) {
            value = v;
            _dispatch("change", { value, isDragging: true });
        }
    };

    _helper.onDragEnd = (event: PointerEvent) => {
        _dispatch("change", { value, isDragging: false });
    };

</script>

<!-- MARKUP ------------------------------------------------------------------->

<template>
    <div class="svc-slider" bind:this={_eSlider}>
        <div class="svc-slider-bed"></div>
        <div
            class="svc-slider-knob"
            style="left:{_knobLeft.toFixed(1)}px; top:{_knobTop.toFixed(1)}px"
            bind:this={_eKnob}>
        </div>
    </div>
</template>

<!-- STYLES ------------------------------------------------------------------->

<style type="text/css">
    .svc-slider {
        width: 200px;
        height: 25px;
        background-color: blue;
        position: relative;
    }

    .svc-slider-knob {
        width: 25px;
        height: 25px;
        position: absolute;
        background-color: red;
        cursor: pointer;
    }
</style>