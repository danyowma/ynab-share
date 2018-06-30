<template>
  <div>
    <div>
      <div v-for="category_group in filteredCategories" v-bind:key="category_group.id">
        <span class="bold">{{category_group.name}}</span>
        <div v-for="category in category_group.categories" v-bind:key="category.id" class="">
          <span>{{category.name}}</span>
          <!--<span>{{convertMilliUnitsToCurrencyAmount(category.budgeted).toFixed(2)}}</span>-->
          <span>{{(category.budgeted / categories[0].categories[0].activity * 100).toFixed(2)}}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { utils } from "ynab";

export default {
  props: ["categories"],
  methods: {
    convertMilliUnitsToCurrencyAmount: utils.convertMilliUnitsToCurrencyAmount
  },
  computed: {
    filteredCategories: function() {
      return this.categories
        .filter(
          categoryGroup =>
            categoryGroup.name !== "Internal Master Category" &&
            categoryGroup.name !== "Hidden Categories" &&
            !categoryGroup.hidden &&
            !categoryGroup.deleted
        )
        .map(categoryGroup => {
          categoryGroup.categories = categoryGroup.categories.filter(
            category => !category.hidden && !category.deleted
          );
          return categoryGroup;
        });
    }
  }
};
</script>

<style>
.bold {
  font-weight: bold;
}
</style>