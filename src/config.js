export default {
  clientId: "a51fbc3f0117cb4163fca3ecdb80749eba91b35c6fae3457590354fa47a64c63",
  redirectUri:
    process.env === "production"
      ? "https://danyowma.github.io/ynab-share/"
      : "https://localhost:8080"
};
