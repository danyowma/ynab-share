<template>
  <div>
    <h5>Select A Budget</h5>
    <div v-for="budget in budgets" class="row" v-bind:key="budget.id">
      <a class="col" href="#" @click="selectBudget(budget.id, $event)">{{budget.name}}</a>
    </div>
  </div>
</template>

<script>
import { format, startOfYear, addMonths, isWithinRange } from "date-fns";

export default {
  props: ["budgets", "selectBudget"],
  methods: {
    getThisYear() {
      const startDate = format(startOfYear(this.today), this.ynabDateFormat);
      const endDate = format(addMonths(this.today, -1), this.ynabDateFormat);

      return;
    }
  },
  computed: {
    today: function() {
      return new Date();
    },
    ynabDateFormat: function() {
      return "YYYY-MM-DD";
    }
  }
};
</script>
