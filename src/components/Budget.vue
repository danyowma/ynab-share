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
      <div>Share: <input type="text" :value="hash" /></div>
      <div v-for="categoryGroupId in Object.keys(mappedBudget)" v-bind:key="categoryGroupId">
          <span class="bold">{{mappedBudget[categoryGroupId].name}}</span>
          <span>{{convertMilliUnitsToCurrencyAmount(mappedBudget[categoryGroupId].budgeted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}}</span>
          <span>{{(mappedBudget[categoryGroupId].budgeted / mappedBudget.totalBudgeted * 100).toFixed(2)}}%</span>
          <div v-for="category in mappedBudget[categoryGroupId].categories" v-bind:key="Object.keys(category)[0]">
              <span>{{category[Object.keys(category)[0]].name}}</span>
              <span>{{convertMilliUnitsToCurrencyAmount(category[Object.keys(category)[0]].budgeted).toFixed(2).toLocaleString()}}</span>
              <span>{{(category[Object.keys(category)[0]].budgeted / mappedBudget.totalBudgeted * 100).toFixed(2)}}%</span>
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
  endOfMonth,
  addMonths,
  isWithinRange,
  compareAsc,
  areRangesOverlapping
} from "date-fns";
import { utils } from "ynab";

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
      hash: ""
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
    },
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
    encode(str) {
      // first we use encodeURIComponent to get percent-encoded UTF-8,
      // then we convert the percent encodings into raw bytes which
      // can be fed into btoa.
      return btoa(
        encodeURIComponent(str).replace(
          /%([0-9A-F]{2})/g,
          function toSolidBytes(match, p1) {
            return String.fromCharCode("0x" + p1);
          }
        )
      );
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
      const mappedBudget = {};
      let totalBudgeted = 0;

      if (
        !areRangesOverlapping(
          this.dateRange.startDate,
          this.dateRange.endDate,
          firstMonth,
          lastMonth
        )
      ) {
        return mappedBudget;
      }
      // move this out because it should only need to be done once
      for (let i = 0; i < categoryGroups.length; i++) {
        const categoryGroup = categoryGroups[i];
        mappedBudget[categoryGroup.id] = {
          name: categoryGroup.name,
          categories: [],
          budgeted: 0
        };
      }

      const startDate =
        compareAsc(this.dateRange.startDate, firstMonth) > -1
          ? this.dateRange.startDate
          : firstMonth;
      const endDate =
        compareAsc(this.dateRange.endDate, lastMonth) < 1
          ? this.dateRange.endDate
          : lastMonth;

      for (let i = 0; i < months.length; i++) {
        const month = months[i];
        if (isWithinRange(month.month, startDate, endDate)) {
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
      mappedBudget.totalBudgeted = totalBudgeted;

      let hashBudget = [];
      const { totalBudgeted: total, ...rest } = { ...mappedBudget };
      for (let categoryGroup of Object.values({ ...rest })) {
        let categories = [];
        for (let category of categoryGroup.categories) {
          categories.push({
            name: category[Object.keys(category)[0]].name,
            budgeted: (
              category[Object.keys(category)[0]].budgeted /
              totalBudgeted *
              100
            ).toFixed(2)
          });
        }
        hashBudget.push({
          name: categoryGroup.name,
          budgeted: (categoryGroup.budgeted / totalBudgeted * 100).toFixed(2),
          categories
        });
      }

      this.hash = `https://localhost:8080/?budget=${this.encode(
        JSON.stringify(hashBudget)
      )}`;

      return mappedBudget;
    }
  }
};
</script>
