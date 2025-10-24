const express = require('express');
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productsController');
const { apiKeyMiddleware } = require('../middlewares/authMiddleware');
const { jwtMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Rutas públicas
router.get('/', apiKeyMiddleware, getProducts);
router.get('/:id', apiKeyMiddleware, getProductById);

// Rutas protegidas con JWT y roles
router.post('/', jwtMiddleware, roleMiddleware(['editor', 'admin']), createProduct);
router.put('/:id', jwtMiddleware, roleMiddleware(['editor', 'admin']), updateProduct);
router.delete('/:id', jwtMiddleware, roleMiddleware(['admin']), deleteProduct);

module.exports = router;