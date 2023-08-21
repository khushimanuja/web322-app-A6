const Sequelize = require('sequelize');
var sequelize = new Sequelize("hdeilckt", "hdeilckt", "K-jSUIVYpeHtB0EE3ssUQEWx1U-DU604", {
  host: "drona.db.elephantsql.com",
  dialect: 'postgres',
  port: 5432,
  logging: false,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });

const Item = sequelize.define('Item', {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
  price: Sequelize.DOUBLE
})

const Categoty = sequelize.define('Category', {
  category: Sequelize.STRING
})

// Item model gets a "category" column that will act as a foreign key to the Category model.
Item.belongsTo(Categoty, {foreignKey: 'category'});

const {gte} = Sequelize.Op;

function initialize() {
    return new Promise((resolve, reject) => {
      sequelize.sync()
        .then(() => {
          resolve();
        }).catch(() => {
          reject("unable to sync the database");
        })
    });
  }

  function getAllItems() {
    return new Promise((resolve, reject) => {
      Item.findAll()
        .then((items) => {
          resolve(items);
        })
        .catch(() => {
          reject('No results returned');
        })
    });
  }

  
  function getPublishedItems() {
    return new Promise((resolve, reject) => {
      Item.findAll()
        .then((items) => {
          resolve(items.filter(item => item.published));
        })
        .catch(() => {
          reject('No results returned');
        })
    });
  }
  
  function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
      getItemsByCategory(category)
        .then((items) => {
          resolve(items.filter(item => item.published));
      })
        .catch((err) => reject("No results returned"));
    });
  }

  function getCategories() {
    return new Promise((resolve, reject) => {
      Categoty.findAll()
        .then((data) => {
          resolve(data);
        })
        .catch(() => {
          reject('No results returned');
        })
    });
  }

  function addItem(itemData) {
    return new Promise((resolve, reject) => {
      if (itemData.published === undefined) itemData.published = false;
      else itemData.published = true;

      for (prop in itemData) {
        itemData.prop = (itemData.prop === "" ? null : itemData.prop);
      }
      itemData.postDate = new Date();
      Item.create(itemData)
        .then(() => {
          resolve();
        })
        .catch(() => {
          reject("unable to create post");
        })
    });
  }

  function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
      Item.findAll()
        .then((items) => {
          resolve(items.filter((item) => item.category.toString() === category));
        })
        .catch(() => {
          reject('No results returned');
        })
    });
  }

  function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
      Item.findAll({
        where: {
            postDate: {
                [gte]: new Date(minDateStr)
            }
        }
      }).then((items) => {
        resolve(items);
      }).catch(() => {
        reject('No results returned');
      })
    });
  }
  

  function getItemById(id) {
    return new Promise((resolve, reject) => {
      getAllItems()
        .then(items => {
          resolve(items.find(item => item.id.toString() === id));
        }).catch(() => {
          reject('No results returned');
        })
    });
  }

  function addCategory(categoryData) {
    return new Promise((resolve, reject) => {
      if (categoryData.category === "") 
        categoryData.category = null
      Categoty.create(categoryData)
        .then(() => {
          resolve();
        }).catch(() => {
          reject("unable to create category");
        })
    })
  }

  function deleteCatrgoryById(id) {
    return new Promise((resolve, reject) => {
      Categoty.destroy( {
        where: {
          id: id
        }
      }).then(() => {
        resolve();
      }).catch(() => {
        reject("unable to delete a category");
      })
    })
  }

  function deleteItemById(id) {
    return new Promise((resolve, reject) => {
      Item.destroy( {
        where: {
          id: id
        }
      }).then(() => {
        resolve();
      }).catch(() => {
        reject("unable to delete the item");
      })
    })
  }

  module.exports = {
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    initialize,
    getAllItems,
    getPublishedItems,
    getPublishedItemsByCategory,
    addCategory,
    deleteCatrgoryById,
    deleteItemById,
    getCategories
  };
  