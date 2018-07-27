<template>
  <div>
    <h5>Select A Budget</h5>
    <div v-for="budget in budgets" class="row" v-bind:key="budget.id">
      <a class="col" href="#" @click="selectBudget(budget.id, $event)">{{budget.name}}</a>
      <!--<span @click="selectBudget(budget.id, $event)">{{budget.name}}</span>-->
    </div>
  </div>
</template>

<script>
import {
  format,
  startOfYear,
  startOfMonth,
  endOfMonth,
  addMonths,
  isWithinRange,
  endOfYear
} from "date-fns";

export default {
  props: ["budgets", "selectBudget"],
  methods: {},
  computed: {
    today: function() {
      return new Date();
    }
  }
};
</script>
