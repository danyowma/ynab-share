<template>
  <div>
    <h5>Select A Budget</h5>
    <div v-for="budget in budgets" class="row" v-bind:key="budget.id">
      <a class="col" href="#" @click="selectBudget(budget.id, $event)">
        {{budget.name}}
      </a>
    </div>
  </div>
</template>

<script>
export default {
  props: ["budgets", "selectBudget"]
};
</script>
