import express from 'express';
import { promisify } from 'util';
import { createClient } from 'redis';

const listProducts = [
  {
    itemId: 1,
    itemName: 'Suitcase 250',
    price: 50,
    initialAvailableQuantity: 4,
  },
  {
    itemId: 2,
    itemName: 'Suitcase 450',
    price: 100,
    initialAvailableQuantity: 10,
  },
  {
    itemId: 3,
    itemName: 'Suitcase 650',
    price: 350,
    initialAvailableQuantity: 2,
  },
  {
    itemId: 4,
    itemName: 'Suitcase 1050',
    price: 550,
    initialAvailableQuantity: 5,
  },
];

function getItemById(id) {
  return listProducts.find((product) => product.itemId === id);
}

async function reserveStockById(itemId, stock) {
  return promisify(client.SET).bind(client)(`item.${itemId}`, stock);
}

async function getCurrentReservedStockById(itemId) {
  return promisify(client.GET).bind(client)(`item.${itemId}`);
}

function resetStock() {
  return Promise.all(
    listProducts.map((product) =>
      promisify(client.SET).bind(client)(`item.${product.itemId}`, 0)
    )
  );
}

const client = createClient();
const PORT = 1245;
const app = express();

app.get('/list_products', (_req, res) => {
  res.json(listProducts);
});

app.get('/list_products/:itemId(\\d+)', (req, res) => {
  const itemId = Number.parseInt(req.params.itemId);
  const product = getItemById(itemId);

  if (!product) {
    res.json({ status: 'Product not found' });
    return;
  }
  getCurrentReservedStockById(itemId)
    .then((result) => Number.parseInt(result || 0))
    .then((reservedStock) => {
      product.currentQuantity =
        product.initialAvailableQuantity - reservedStock;
      res.json(product);
    });
});

app.get('/reserve_product/:itemId', (req, res) => {
  const itemId = Number.parseInt(req.params.itemId);
  const product = getItemById(itemId);

  if (!product) {
    res.json({ status: 'Product not found' });
    return;
  }
  getCurrentReservedStockById(itemId)
    .then((result) => Number.parseInt(result || 0))
    .then((reservedStock) => {
      if (reservedStock >= product.initialAvailableQuantity) {
        res.json({ status: 'Not enough stock available', itemId });
        return;
      }
      reserveStockById(itemId, reservedStock + 1).then(() => {
        res.json({ status: 'Reservation confirmed', itemId });
      });
    });
});

app.listen(PORT, () => {
  resetStock()
    .then(() => {
      console.log(`Application started on port ${PORT}.`);
    })
    .catch((err) => {
      console.log(
        `Application failed to start on port ${PORT}, Error: ${err.message.toString()}`
      );
    });
});
