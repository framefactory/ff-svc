<script context="module" lang="typescript">
</script>

<script lang="typescript">
export let name: string = "Button";
</script>

<!-- MARKUP ------------------------------------------------------------------->

<button>
Hello, {name}!!
</button>

<!-- STYLES ------------------------------------------------------------------->

<style type="text/scss">
@import "theme";

button {
    background: $color-primary;
}
</style>