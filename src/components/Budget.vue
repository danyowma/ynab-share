<template>
  <div>
    {{this.budget.name}}
    <div v-for="categoryGroupId in Object.keys(mappedBudget)" v-bind:key="categoryGroupId">
      <span class="bold">{{mappedBudget[categoryGroupId].name}}</span>
      <span>{{(mappedBudget[categoryGroupId].budgeted / mappedBudget.totalBudgeted * 100).toFixed(2)}}%</span>
      <div v-for="category in mappedBudget[categoryGroupId].categories" v-bind:key="Object.keys(category)[0]">
          <span>{{category[Object.keys(category)[0]].name}}</span>
          <span>{{convertMilliUnitsToCurrencyAmount(category[Object.keys(category)[0]].budgeted).toFixed(2)}}</span>
          <span>{{(category[Object.keys(category)[0]].budgeted / mappedBudget.totalBudgeted * 100).toFixed(2)}}%</span>
      </div>
    </div>
  </div>
</template>

<script>
import {
  format,
  startOfYear,
  addMonths,
  isWithinRange,
  compareAsc,
  isThisYear
} from "date-fns";
import { utils } from "ynab";

export default {
  props: ["budget"],
  methods: {
    convertMilliUnitsToCurrencyAmount: utils.convertMilliUnitsToCurrencyAmount,
    getThisYear() {
      const yearStart = format(startOfYear(this.today), this.ynabDateFormat);
      const yearEnd = format(addMonths(this.today, -1), this.ynabDateFormat);

      return { yearStart, yearEnd };
    }
  },
  computed: {
    mappedBudget: function() {
      const { yearStart, yearEnd } = this.getThisYear();
      const {
        first_month: firstMonth,
        last_month: lastMonth,
        months,
        category_groups: categoryGroups,
        categories
      } = this.budget;
      const mappedBudget = {};
      for (let i = 0; i < categoryGroups.length; i++) {
        const categoryGroup = categoryGroups[i];
        mappedBudget[categoryGroup.id] = {
          name: categoryGroup.name,
          categories: [],
          budgeted: 0
        };
      }
      let totalBudgeted = 0;
      const startDate =
        compareAsc(startOfYear, firstMonth) === 1 ? startOfYear : firstMonth;
      const endDate = isThisYear(lastMonth) ? lastMonth : endOfYear;

      for (let i = 0; i < months.length; i++) {
        const month = months[i];
        if (isWithinRange(month.month, startDate, endDate)) {
          for (let j = 0; j < month.categories.length; j++) {
            const category = month.categories[j];
            const existingCategoryIndex = mappedBudget[
              category.category_group_id
            ].categories.findIndex(x => Object.keys(x)[0] === category.id);
            if (existingCategoryIndex > -1) {
              mappedBudget[category.category_group_id].categories[
                existingCategoryIndex
              ][category.id].budgeted +=
                category.budgeted;
            } else {
              mappedBudget[category.category_group_id].categories.push({
                [category.id]: {
                  name: category.name,
                  budgeted: category.budgeted
                }
              });
            }
            mappedBudget[category.category_group_id].budgeted +=
              category.budgeted;
            totalBudgeted += category.budgeted;
          }
        }
      }
      mappedBudget.totalBudgeted = totalBudgeted;
      return mappedBudget;
    },
    today: function() {
      return new Date();
    },
    ynabDateFormat: function() {
      return "YYYY-MM-DD";
    }
  }
};
</script>
