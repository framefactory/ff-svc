<script context="module" lang="typescript">
const options = {
    start: "flex-start",
    end: "flex-end",
    between: "space-between",
    around: "space-around",
    evenly: "space-evenly",
};
</script>

<script lang="typescript">
declare const options;

export let expand = false;
export let column = false;
export let wrap = false;
export let center = false;
export let end = false;

export let justify = "default";
export let items = "stretch";
export let content = "stretch";

let styles = [
    "justify-content:", options[justify] || justify,
    ";align-items:", options[items] || items,
    ";align-content:", options[content] || content,
].join("");

</script>

<!-- MARKUP ------------------------------------------------------------------->

<div
    class:expand
    class:column
    class:wrap
    class:center
    class:end
    style="{styles}"
>
    <slot/>
</div>

<!-- STYLES ------------------------------------------------------------------->

<style type="text/scss">
div {
    display: flex;
    background-color: burlywood;
}
.expand { position: absolute; top: 0; right: 0; bottom: 0; left: 0 }
.column { flex-direction: column; }
.wrap { flex-wrap: wrap; }
.center { justify-content: center; }
.end { justify-content: flex-end; }
</style>