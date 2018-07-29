<template>
  <div>
    <div v-for="categoryGroupId in Object.keys(budget)" v-bind:key="categoryGroupId">
      <span>{{budget[categoryGroupId].name}}</span>
      <span>{{budget[categoryGroupId].budgetedPercentage}}%</span>
      <div v-for="category in budget[categoryGroupId].categories" v-bind:key="Object.keys(category)[0]">
          <span>{{category[Object.keys(category)[0]].name}}</span>
          <span>{{category[Object.keys(category)[0]].budgetedPercentage}}%</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["budget"]
};
</script>
