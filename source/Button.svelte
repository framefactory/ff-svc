<script context="module" lang="typescript">
</script>

<script lang="typescript">
export let primary: boolean;
export let link: boolean;
export let grow: boolean;
export let shrink: boolean;
export let width: number;
export let height: number;

let className: string = "";
export { className as class };

const styles = "";
</script>

<!-- MARKUP ------------------------------------------------------------------->

<button
    class:primary
    class:link
    class:grow
    class:shrink
    class={className}
    style={styles}
>
    <slot></slot>
</button>

<!-- STYLES ------------------------------------------------------------------->

<style type="text/scss">
button {
    background-color: blue;
    &.grow { flex-grow: 1; }
    &.shrink { flex-shrink: 1; }
}
.primary {

}
.link {

}

</style>