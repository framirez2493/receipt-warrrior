module.exports = function(sequelize, DataTypes) {
  var Product = sequelize.define("Product", {
    purchase_date: DataTypes.DATE,
    product_name: DataTypes.STRING,
    product_price: { 
        type: DataTypes.DECIMAL(10,2)
    },
    warranty_expire_date: DataTypes.DATE,
    store: DataTypes.STRING,
    receipt_URL: DataTypes.STRING,
    warranty_URL: DataTypes.STRING,
    receipt_OCR: DataTypes.TEXT,
    warranty_OCR: DataTypes.TEXT,
    notes: DataTypes.STRING,
  });

  
  Product.associate = function(models) {
    // We're saying that a Prodct should belong to an User
    // A Prodcut can't be created without an User due to the foreign key constraint
  
    Product.belongsTo(models.User, {
        foreignKey: {
            allowNull: false
        }
    })      
  };

  return Product;
};


