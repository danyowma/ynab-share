<template>
  <div id="app">
    <Nav />
    <div>
      <h1 v-if="loading">Loading...</h1>
      <div v-if="error">
        <h1 class="display-4">Oops!</h1>
        <p class="lead">{{error}}</p>
        <button class="btn btn-primary" @click="resetToken">Try Again &gt;</button>
      </div>
      <div v-else>
        <form v-if="!ynab.token">
          <div class="form-group">
            <h1 class="display-5">Hello!</h1>
            <p class="lead">If you would like to use this App, please authorize with YNAB!</p>
            <button @click="authorizeWithYNAB" class="btn btn-primary">Authorize This App With YNAB &gt;</button>
          </div>
        </form>

        <!-- Otherwise if we have a token, show the budget select -->
        <Budgets v-else-if="!budgetId" :budgets="budgets" :selectBudget="selectBudget" />

        <!-- If a budget has been selected, display transactions from that budget -->
        <div v-else-if="!loading">
          <Categories :categories="categories" />
          <button class="btn btn-info" @click="budgetId = null">&lt; Select Another Budget</button>
        </div>

      </div>

      <Footer />
    </div>
  </div>
</template>

<script>
import * as ynab from "ynab";
import config from "./config";
import Nav from "./components/Nav.vue";
import Footer from "./components/Footer.vue";
import Budgets from "./components/Budgets.vue";
import Categories from "./components/Categories.vue";

export default {
  data() {
    return {
      ynab: {
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        token: null,
        api: null
      },
      loading: false,
      error: null,
      budgetId: null,
      budgets: [],
      transactions: [],
      categories: []
    };
  },
  created() {
    this.ynab.token = this.findYNABToken();
    if (this.ynab.token) {
      this.api = new ynab.api(this.ynab.token);
      if (!this.budgetId) {
        this.getBudgets();
      } else {
        this.selectBudget(this.budgetId);
      }
    }
  },
  methods: {
    getBudgets() {
      this.loading = true;
      this.error = null;
      this.api.budgets
        .getBudgets()
        .then(res => {
          this.budgets = res.data.budgets;
        })
        .catch(err => {
          this.error = err.error.detail;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    selectBudget(id) {
      this.loading = true;
      this.error = null;
      this.budgetId = id;
      this.categories = [];
      this.api.categories
        .getCategories(id)
        .then(res => {
          this.categories = res.data.category_groups;
        })
        .catch(err => {
          this.error = err.error.detail;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    authorizeWithYNAB(e) {
      e.preventDefault();
      const uri = `https://app.youneedabudget.com/oauth/authorize?client_id=${
        this.ynab.clientId
      }&redirect_uri=${encodeURIComponent(
        this.ynab.redirectUri
      )}&response_type=token`;
      location.replace(uri);
    },
    findYNABToken() {
      let token = null;
      const search = window.location.hash
        .substring(1)
        .replace(/&/g, '","')
        .replace(/=/g, '":"');
      if (search && search !== "") {
        const params = JSON.parse('{"' + search + '"}', function(key, value) {
          return key === "" ? value : decodeURIComponent(value);
        });
        token = params.access_token;
        sessionStorage.setItem("ynab_access_token", token);
        window.location.hash = "";
      } else {
        token = sessionStorage.getItem("ynab_access_token");
      }
      return token;
    },
    resetToken() {
      sessionStorage.removeItem("ynab_access_token");
      this.ynab.token = null;
      this.error = null;
    }
  },
  components: {
    Nav,
    Footer,
    Budgets,
    Categories
  }
};
</script>
