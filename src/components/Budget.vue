<template>
  <div class="container">
    <button @click="this.clearBudget" class="select-budget-button">&lt; Select another budget</button>
    <div class="budget-name">{{this.budget.name}}</div>
    <div class="share">
      <div>Copy url to share:</div>
      <input type="text" :value="budgetUrl" @click="selectText" class="share-input" />
    </div>
    <div class="dates">
      <div class="date-button-container"><button @click="selectDateRange(getThisMonth())" class="date-button">This Month</button></div>
      <div class="date-button-container"><button @click="selectDateRange(getLatest3Months())" class="date-button">Latest 3 Months</button></div>
      <div class="date-button-container"><button @click="selectDateRange(getThisYear())" class="date-button">This Year</button></div>
      <div class="date-button-container"><button @click="selectDateRange(getLastYear())" class="date-button">Last Year</button></div>
    </div>
    <div class="include-percentages">
      <input type="checkbox" id="percentages" v-model="includePercentages" class="include-percentages-checkbox" />
      <label for="percentages" class="include-percentages-label">Include percentages</label>
    </div>
    <div v-if="!Object.keys(mappedBudget).length">
      There is not enough data. Please select a different date range.
    </div>

    <div v-else>
      <div v-for="categoryGroupId in Object.keys(mappedBudget)" v-bind:key="categoryGroupId">
          <div class="category-group">
            <span class="category-group-name">{{mappedBudget[categoryGroupId].name}}</span>
            <span v-if="includePercentages" class="category-group-percentage">{{(mappedBudget[categoryGroupId].budgeted / totalBudgeted * 100).toFixed(2)}}%</span>
          </div>
          <div v-for="category in mappedBudget[categoryGroupId].categories" v-bind:key="Object.keys(category)[0]">
              <div class="category">
                <span class="category-name">{{category[Object.keys(category)[0]].name}}</span>
                <span v-if="includePercentages" class="category-percentage">{{(category[Object.keys(category)[0]].budgeted / totalBudgeted * 100).toFixed(2)}}%</span>
              </div>
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
  areRangesOverlapping,
  isSameDay
} from "date-fns";
import config from "../config";
import lzString from "lz-string";

const dateRangeNames = {
  thisMonth: "thisMonth",
  latest3Months: "latest3Months",
  thisYear: "thisYear",
  lastYear: "lastYear"
};

export default {
  props: ["budget", "clearBudget"],
  data() {
    return {
      dateRange: this.getThisMonth(),
      totalBudgeted: 0,
      includePercentages: true
    };
  },
  methods: {
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
    selectText(e) {
      e.target.setSelectionRange(0, e.target.value.length);
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

      if (
        !areRangesOverlapping(startDate, endDate, firstMonth, lastMonth) &&
        !(isSameDay(startDate, endDate) && isSameDay(startDate, lastMonth))
      ) {
        return mappedBudget;
      }

      const internalMasterCategory = categoryGroups.find(
        x => x.name === "Internal Master Category"
      );

      for (let i = 0; i < categoryGroups.length; i++) {
        const categoryGroup = categoryGroups[i];
        if (categoryGroup.id !== internalMasterCategory.id) {
          mappedBudget[categoryGroup.id] = {
            name: categoryGroup.name,
            categories: [],
            budgeted: 0
          };
        }
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
            if (category.category_group_id === internalMasterCategory.id) {
              continue;
            }
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
          let categoryData = {
            name: category[Object.keys(category)[0]].name
          };

          if (this.includePercentages) {
            categoryData.budgeted = (
              category[Object.keys(category)[0]].budgeted /
              this.totalBudgeted *
              100
            ).toFixed(2);
          }
          categories.push(categoryData);
        }

        let categoryGroupData = {
          name: categoryGroup.name,
          categories
        };

        if (this.includePercentages) {
          categoryGroupData.budgeted = (
            categoryGroup.budgeted /
            this.totalBudgeted *
            100
          ).toFixed(2);
        }

        budget.push(categoryGroupData);
      }

      const lzEncodedBudget = lzString.compressToEncodedURIComponent(
        JSON.stringify(budget)
      );

      return `${config.redirectUri}?budget=${lzEncodedBudget}${
        !this.includePercentages ? "&includePercentages=false" : ""
      }`;
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 500px;
  margin: 0 auto;
}

.budget-name {
  padding: 0 20px 12px;
  font: 700 20px Helvetica, Arial, sans-serif;
}

.share {
  padding: 0 20px;
  font-size: 12px;
}

.share-input {
  width: 100%;
  padding: 4px;
  margin-top: 4px;
}

.share-input:focus {
  outline: none;
}

.select-budget-button {
  padding: 0;
  margin: 10px 20px 20px;
  border: none;
  background: white;
  font-size: 12px;
  color: #009cc2;
  cursor: pointer;
}

.select-budget-button:focus {
  outline: none;
}

.dates {
  display: flex;
  flex-wrap: wrap;
  margin-top: 12px;
}

.date-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  height: 32px;
}

.date-button {
  padding: 8px;
  border: none;
  border-radius: 12px;
  background: white;
  font-size: 12px;
  color: #009cc2;
  cursor: pointer;
}

.date-button:focus {
  outline: none;
}

.include-percentages {
  display: inline-block;
  margin: 10px 20px;
  cursor: pointer;
}

.include-percentages-checkbox,
.include-percentages-label {
  cursor: pointer;
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

@media (min-width: 450px) {
  .budget-name,
  .share {
    padding-left: 0;
  }

  .select-budget-button,
  .include-percentages {
    margin-left: 0;
  }

  .dates {
    flex-wrap: nowrap;
  }

  .date-button-container {
    width: auto;
    height: auto;
    margin-right: 20px;
  }

  .date-button {
    padding: 0;
  }
}
</style>