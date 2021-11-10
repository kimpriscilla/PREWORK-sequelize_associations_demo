const {
  syncAndSeed,
  models: { User, Department },
} = require("./db");
const express = require("express");
const app = express();

app.use(require("method-override")("_method"));
app.use(express.urlencoded({ extended: false }));

app.put("/departments/:id", async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    await department.update(req.body);
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

app.get("/", async (req, res, next) => {
  //! our homepage that gets all users & departments
  try {
    const [users, departments] = await Promise.all([
      User.findAll({
        //!find all users with department that they manage
        include: [Department],
      }),
      Department.findWithManagers(),
    ]);
    res.send(
      `   <html>
        <head>
          <title> Sequelize Association Demo</title>
        </head>
        <body>
          <div>
            <h2>Departments</h2>
            <ul>
              ${departments
                .map(
                  (department) => `
              <li>
              ${department.name}
              ${department.isManaged()}
              <form method='POST' action='/departments/${
                department.id
              }?_method=PUT'>
              <select name ='managerId'>
              <option value = '' > -- not managed-- </option>
              ${users
                .map(
                  (user) => `
              <option value ='${user.id}'  ${
                    user.id === department.managerId
                      ? 'selected="selected"'
                      : ""
                  }>${user.name}</option>
              `
                )
                .join("")}
              </select>
              <button>Save</button>
              </form>
              </li>
              `
                )
                .join("")}
            </ul>
          </div>
          <div>
            <h2>Users</h2>
            <ul>
              ${users
                .map(
                  (user) => `
              <li>
              ${user.name}
              <ul>
              ${user.departments //! because we did an includes in Department so we can display which user belongs to which department
                .map(
                  (department) => `
              <li>
              ${department.name}
              </li>

              `
                )
                .join("")}
              </ul>
              </li>
              `
                )
                .join("")}
            </ul>
          </div>
        </body>
      </html>
    `
    );
  } catch (error) {
    next(error);
  }
});

const start = async () => {
  try {
    await syncAndSeed();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`listening on port ${PORT}`));
    console.log("hi im ready!!");
  } catch (error) {
    console.log(error);
  }
};
start();
