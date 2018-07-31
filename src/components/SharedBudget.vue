<template>
  <div>
    <button @click="clearSharedBudget">Share your own budget!</button>
    <div v-for="categoryGroup in budget" v-bind:key="categoryGroup.name">
      <span>{{categoryGroup.name}}</span>
      <span>{{categoryGroup.budgeted}}%</span>
      <div v-for="category in categoryGroup.categories" :key="`${categoryGroup.name}-${category.name}`">
          <span>{{category.name}}</span>
          <span>{{category.budgeted}}%</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["budget", "clearSharedBudget"]
};
</script>
