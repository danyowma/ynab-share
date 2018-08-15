<template>
    <div class="hero">
      <div>
        <div class="hero-header">Let&rsquo;s talk budgets</div>
        <div class="hero-description">
          Share your budget with friends. Geek out with other YNABers. The amounts are hidden to make it less awkward.
        </div>
      </div>
      <button @click="authorizeWithYNAB" class="button">Sign in with YNAB</button>
    </div>
</template>

<script>
export default {
  props: ["authorizeWithYNAB"]
};
</script>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: 100%;
  padding: 54px 20px;
  background: #85c3e9;
  color: white;
  text-align: center;
}

.hero-header {
  padding: 0 24px 24px;
  font: 900 60px Helvetica, Arial, sans-serif;
  text-transform: capitalize;
  line-height: 1em;
}

.hero-description {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 75%;
  margin: 0 auto;
  font: 400 24px Helvetica, Arial, sans-serif;
  line-height: 1.5em;
}

.button {
  width: 220px;
  padding: 24px;
  border: none;
  border-bottom: 5px solid transparent;
  border-radius: 5px;
  background: #f3783c;
  font: 400 18px Helvetica, Arial, sans-serif;
  color: white;
  text-transform: uppercase;
  cursor: pointer;
}

.button:hover {
  border-bottom: 5px solid #d55522;
}

.button:focus {
  outline: none;
}

@media (min-width: 500px) {
  .hero {
    height: calc(100% - 64px);
  }
}
</style>