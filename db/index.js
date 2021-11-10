//!DATA LAYER

const Sequelize = require("sequelize");
const db = new Sequelize(
  process.env.DATABASE || "postgres://localhost/sequelize_associations_db"
);

const User = db.define("user", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
});

const Department = db.define("department", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
});

Department.findWithManagers = () => {
  //now a class method
  return Department.findAll({
    //! find all department with userId who is managing that department
    include: [{ model: User, as: "manager" }],
    order: [["name"]], //! put our departments names in acsending order
  });
};

Department.prototype.isManaged = function () {
  //instances
  return !!this.managerId;
};

Department.beforeSave((department) => {
  //!SEQUELIZE HOOK!
  if (department.managerId === "") department.managerId = null;
});

//!associations
Department.belongsTo(User, { as: "manager" }); //!makes foreign key as managers
User.hasMany(Department, { foreignKey: "managerId" }); //!if a user wants to find departments, have to be specific & specify that the foreign key as manager key

const syncAndSeed = async () => {
  await db.sync({ force: true }); //!creating any tables i have like drop table if exits
  const [lucy, moe, larry] = await Promise.all(
    ["lucy", "moe", "larry"].map((name) => User.create({ name }))
  );
  const [hr, engineering, marketing] = await Promise.all(
    ["hr", "engineering", "marketing"].map((name) =>
      Department.create({ name })
    )
  );
  engineering.managerId = lucy.id;
  marketing.managerId = lucy.id;
  await Promise.all([engineering.save(), marketing.save()]);
};

module.exports = {
  syncAndSeed,
  models: {
    User,
    Department,
  },
};
