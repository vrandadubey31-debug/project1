const app = require("./vercel");

const PORT = process.env.PORT || 9191;

app.listen(PORT, () => {
  console.log(
    `🚀 Server Running On Port ${PORT}`
  );
});
