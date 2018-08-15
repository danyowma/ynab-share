<template>
  <div class="container">
    <button @click="clearSharedBudget" class="share-button">Share your own budget!</button>
    <div v-for="categoryGroup in budget" v-bind:key="categoryGroup.name">
      <div class="category-group">
        <span class="category-group-name">{{categoryGroup.name}}</span>
        <span v-if="includePercentages" class="category-group-percentage">{{categoryGroup.budgeted}}%</span>
      </div>
      <div v-for="category in categoryGroup.categories" :key="`${categoryGroup.name}-${category.name}`">
        <div class="category">
          <span class="category-name">{{category.name}}</span>
          <span v-if="includePercentages" class="category-percentage">{{category.budgeted}}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["budget", "includePercentages", "clearSharedBudget"]
};
</script>

<style scoped>
.container {
  max-width: 500px;
  margin: 0 auto;
}

.category-group {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 20px;
  border-top: 1px solid #dee3e8;
  background: #e5f5f9;
  text-align: right;
}

.category {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 20px;
  border-top: 1px solid #dee3e8;
  text-align: right;
}

.category-group-name,
.category-name {
  width: 75%;
  text-align: left;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.category-group-percentage,
.category-percentage {
  flex: 1;
}

.share-button {
  padding: 8px 20px;
  margin: 20px;
  border: none;
  border-radius: 20px;
  background: #009cc2;
  color: white;
  font-size: 16px;
  cursor: pointer;
}

.share-button:focus {
  outline: none;
}

@media (min-width: 500px) {
  .share-button {
    margin: 20px 20px 20px 0;
  }
}
</style>