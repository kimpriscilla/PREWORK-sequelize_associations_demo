const { syncAndSeed } = require("./db");

const start = async () => {
  try {
    await syncAndSeed();
    console.log("hi im ready!!");
  } catch (error) {
    console.log(error);
  }
};
start();
