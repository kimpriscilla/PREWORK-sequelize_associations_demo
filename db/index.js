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

Department.belongsTo(User); //! associations!
//User.hasMany(Department); //! associations

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
  engineering.userId = lucy.id;
  marketing.userId = lucy.id;
  await Promise.all([engineering.save(), marketing.save()]);
};

module.exports = {
  syncAndSeed,
  models: {
    Users,
    Department,
  },
};
