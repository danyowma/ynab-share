<template>
  <div>
    {{this.budget.name}}
    <a href="#" @click="selectDateRange(getThisMonth())">This Month</a>
    <a href="#" @click="selectDateRange(getLatest3Months())">Latest 3 Months</a>
    <a href="#" @click="selectDateRange(getThisYear())">This Year</a>
    <a href="#" @click="selectDateRange(getLastYear())">Last Year</a>
    <div v-if="!Object.keys(mappedBudget).length">
      Not enough data
    </div>

    <div v-else>
      <div>Share: <input type="text" :value="budgetUrl" /></div>
      <div v-for="categoryGroupId in Object.keys(mappedBudget)" v-bind:key="categoryGroupId">
          <span>{{mappedBudget[categoryGroupId].name}}</span>
          <span>{{convertMilliUnitsToCurrencyAmount(mappedBudget[categoryGroupId].budgeted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}}</span>
          <span>{{(mappedBudget[categoryGroupId].budgeted / totalBudgeted * 100).toFixed(2)}}%</span>
          <div v-for="category in mappedBudget[categoryGroupId].categories" v-bind:key="Object.keys(category)[0]">
              <span>{{category[Object.keys(category)[0]].name}}</span>
              <span>{{convertMilliUnitsToCurrencyAmount(category[Object.keys(category)[0]].budgeted).toFixed(2).toLocaleString()}}</span>
              <span>{{(category[Object.keys(category)[0]].budgeted / totalBudgeted * 100).toFixed(2)}}%</span>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import {
  format,
  startOfYear,
  endOfYear,
  addYears,
  startOfMonth,
  addMonths,
  isWithinRange,
  compareAsc,
  areRangesOverlapping
} from "date-fns";
import { utils } from "ynab";
import config from "../config";
import lzString from "lz-string";

const dateRangeNames = {
  thisMonth: "thisMonth",
  latest3Months: "latest3Months",
  thisYear: "thisYear",
  lastYear: "lastYear"
};

export default {
  props: ["budget"],
  data() {
    return {
      dateRange: this.getThisMonth(),
      totalBudgeted: 0
    };
  },
  methods: {
    convertMilliUnitsToCurrencyAmount: utils.convertMilliUnitsToCurrencyAmount,
    selectDateRange(dateRange) {
      this.dateRange = dateRange;
    },
    formatAsYnabDate(date) {
      return format(date, "YYYY-MM-DD");
    },
    getThisMonth() {
      const startDate = this.formatAsYnabDate(startOfMonth(new Date()));
      return {
        name: dateRangeNames.thisMonth,
        startDate,
        endDate: startDate
      };
    },
    getLatest3Months() {
      const endDate = this.formatAsYnabDate(startOfMonth(new Date()));
      const startDate = this.formatAsYnabDate(addMonths(endDate, -2));
      return {
        name: dateRangeNames.latest3Months,
        startDate,
        endDate
      };
    },
    getThisYear() {
      const startDate = this.formatAsYnabDate(startOfYear(new Date()));
      const endDate = this.formatAsYnabDate(
        startOfMonth(endOfYear(new Date()))
      );
      return { name: dateRangeNames.thisYear, startDate, endDate };
    },
    getLastYear() {
      const startDate = this.formatAsYnabDate(
        startOfYear(addYears(new Date(), -1))
      );
      const endDate = this.formatAsYnabDate(startOfMonth(endOfYear(startDate)));
      return { name: dateRangeNames.lastYear, startDate, endDate };
    }
  },
  computed: {
    mappedBudget: function() {
      const {
        first_month: firstMonth,
        last_month: lastMonth,
        months,
        category_groups: categoryGroups,
        categories
      } = this.budget;
      const { startDate, endDate } = this.dateRange;
      const mappedBudget = {};
      let totalBudgeted = 0;

      if (!areRangesOverlapping(startDate, endDate, firstMonth, lastMonth)) {
        return mappedBudget;
      }

      for (let i = 0; i < categoryGroups.length; i++) {
        const categoryGroup = categoryGroups[i];
        mappedBudget[categoryGroup.id] = {
          name: categoryGroup.name,
          categories: [],
          budgeted: 0
        };
      }

      const start =
        compareAsc(startDate, firstMonth) > -1 ? startDate : firstMonth;
      const end = compareAsc(endDate, lastMonth) < 1 ? endDate : lastMonth;

      for (let i = 0; i < months.length; i++) {
        const month = months[i];
        if (isWithinRange(month.month, start, end)) {
          for (let j = 0; j < categories.length; j++) {
            const category = month.categories.find(
              x => x.id === categories[j].id
            );
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
      this.totalBudgeted = totalBudgeted;

      return mappedBudget;
    },
    budgetUrl: function() {
      if (!Object.keys(this.mappedBudget).length) {
        return null;
      }

      let budget = [];
      for (let categoryGroup of Object.values({ ...this.mappedBudget })) {
        let categories = [];
        for (let category of categoryGroup.categories) {
          categories.push({
            name: category[Object.keys(category)[0]].name,
            budgeted: (
              category[Object.keys(category)[0]].budgeted /
              this.totalBudgeted *
              100
            ).toFixed(2)
          });
        }
        budget.push({
          name: categoryGroup.name,
          budgeted: (categoryGroup.budgeted / this.totalBudgeted * 100).toFixed(
            2
          ),
          categories
        });
      }

      const lzEncodedBudget = lzString.compressToEncodedURIComponent(
        JSON.stringify(budget)
      );

      return `${config.redirectUri}?budget=${lzEncodedBudget}`;
    }
  }
};
</script>
