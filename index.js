const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

//const promanage = require('./api/src/promanage/feature/')

dotenv.config();
const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('¡Servidor de ProManage funcionando! 🚀');
});

const promanageProduct = require('./api/src/promanage/feature/inventary/product/ProductRoute');
app.use('/promanage/api/product', promanageProduct);
const promanageCategory = require('./api/src/promanage/feature/inventary/category/CategoryRoute');
app.use('/promanage/api/category', promanageCategory);
const promanageStatus = require('./api/src/promanage/feature/inventary/status/StatusRoute');
app.use('/promanage/api/status', promanageStatus);

const promanageUser = require('./api/src/promanage/feature/personal/user/UserRoute');
app.use('/promanage/api/user', promanageUser);
const promanageRole = require('./api/src/promanage/feature/personal/role/RoleRoute');
app.use('/promanage/api/role', promanageRole);

const promanagePurchase = require('./api/src/promanage/feature/buy/purchase/PurchaseRoute');
app.use ('/promanage/api/purchase', promanagePurchase);
const promanageSupplier = require('./api/src/promanage/feature/buy/supplier/SupplierRoute');
app.use ('/promanage/api/supplier', promanageSupplier);

const promanageSale = require('./api/src/promanage/feature/sell/SaleRoute');
app.use('/promanage/api/sale', promanageSale);

const promanageHome = require('./api/src/promanage/feature/inventary/dashboard/Home');
app.use('/promanage/api/dashboard', promanageHome);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});