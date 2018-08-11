<template>
  <div class="container">
    <h3 class="heading">My Budgets</h3>
    <div class="budgets">
      <div v-for="budget in budgets" :key="budget.id" @click="selectBudget(budget.id, $event)" class="budget">
          <div class="budget-name">{{budget.name}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["budgets", "selectBudget"]
};
</script>

<style scoped>
.container {
  padding: 0 20px 20px;
}

.heading {
  padding: 20px 0 20px;
  margin: 0;
  font-size: 20px;
}

.budgets {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.budget {
  display: block;
  width: 200px;
  height: 200px;
  margin: 0 20px 20px 0;
  border: 1px solid #dfe4e9;
}

.budget-name {
  width: 100%;
  height: 100%;
  padding: 8px;
  border: none;
  font-size: 16px;
  cursor: pointer;
}
</style>