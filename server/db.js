
const products = [];

function saveProduct(product) {
  products.push({ ...product, id: products.length + 1, createdAt: new Date().toISOString() });
  return products[products.length - 1];
}

function listProducts() {
  return products;
}

module.exports = { saveProduct, listProducts };