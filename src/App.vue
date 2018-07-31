<template>
  <div>
    <h1>YNAB Share</h1>
    <div>
      <h1 v-if="loading">Loading...</h1>
      <div v-if="error">
        <h1>Oops!</h1>
        <p>{{error}}</p>
        <button @click="resetToken">Try Again &gt;</button>
      </div>
      <div v-else>
        <div v-if="sharedBudget && sharedBudget.length">
          <SharedBudget :budget="sharedBudget" :clearSharedBudget="clearSharedBudget" />
        </div>
        <form v-else-if="!ynab.token">
          <div>
            <h1>Hello!</h1>
            <p>If you would like to use this App, please authorize with YNAB!</p>
            <button @click="authorizeWithYNAB">Authorize This App With YNAB &gt;</button>
          </div>
        </form>

        <Budgets v-else-if="!budgetId && !loading" :budgets="budgets" :selectBudget="selectBudget" />

        <div v-else-if="!loading">
          <Budget :budget="budget" />
          <button @click="budgetId = null">&lt; Select Another Budget</button>
        </div>

      </div>

      <Footer />
    </div>
  </div>
</template>

<script>
import * as ynab from "ynab";
import config from "./config";
import Budgets from "./components/Budgets.vue";
import Budget from "./components/Budget.vue";
import SharedBudget from "./components/SharedBudget.vue";
import lzString from "lz-string";

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
      budget: null,
      sharedBudget: null
    };
  },
  created() {
    let querystring = new URLSearchParams(window.location.search.substring(1));
    const budget = querystring.get("budget");
    if (budget) {
      const sharedBudget = lzString.decompressFromEncodedURIComponent(budget);
      this.sharedBudget = JSON.parse(sharedBudget);
    } else {
      this.ynab.token = this.findYNABToken();
      if (this.ynab.token) {
        this.api = new ynab.api(this.ynab.token);
        if (!this.budgetId) {
          this.getBudgets();
        } else {
          this.selectBudget(this.budgetId);
        }
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
      this.budget = null;
      this.api.budgets
        .getBudgetById(id)
        .then(res => {
          this.budget = res.data.budget;
          console.log("budget", this.budget);
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
    },
    clearSharedBudget() {
      this.sharedBudget = null;
      location = [
        location.protocol,
        "//",
        location.host,
        location.pathname
      ].join("");
    }
  },
  components: {
    Budgets,
    Budget,
    SharedBudget
  }
};
</script>
