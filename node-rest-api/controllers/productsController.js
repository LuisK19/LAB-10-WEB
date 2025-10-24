const supabase = require('../models/supabaseClient');
const { convertToXml } = require('../utils/xmlConverter'); // Asumimos que crearemos esta utilidad

const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Primero obtener el conteo total
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    // Luego obtener los productos con paginación
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    const response = {
      data: products || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };

    // Negociación de contenido
    if (req.headers.accept === 'application/xml') {
      res.set('Content-Type', 'application/xml');
      return res.send(convertToXml(response));
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No found
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
            timestamp: new Date().toISOString(),
            path: req.path
          }
        });
      }
      throw error;
    }

    if (req.headers.accept === 'application/xml') {
      res.set('Content-Type', 'application/xml');
      return res.send(convertToXml({ data: product }));
    }

    res.json({ data: product });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, sku, price, stock, category } = req.body;

    // Validaciones
    if (!name || !sku || !price || !stock || !category) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'All fields are required: name, sku, price, stock, category',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    if (price <= 0) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Price must be greater than 0',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    if (stock < 0) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Stock must be greater than or equal to 0',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    // Verificar si el SKU ya existe
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('sku', sku)
      .single();

    if (existingProduct) {
      return res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'SKU already exists',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    // Insertar el producto
    const { data: product, error } = await supabase
      .from('products')
      .insert([{ name, sku, price, stock, category }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, sku, price, stock, category } = req.body;

    // Validaciones
    if (price !== undefined && price <= 0) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Price must be greater than 0',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Stock must be greater than or equal to 0',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    // Verificar si el producto existe
    const { data: existingProduct } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingProduct) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    // Si se está actualizando el SKU, verificar que no exista otro con el mismo SKU
    if (sku && sku !== existingProduct.sku) {
      const { data: productWithSku } = await supabase
        .from('products')
        .select('id')
        .eq('sku', sku)
        .single();

      if (productWithSku) {
        return res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: 'SKU already exists',
            timestamp: new Date().toISOString(),
            path: req.path
          }
        });
      }
    }

    // Actualizar el producto
    const { data: product, error } = await supabase
      .from('products')
      .update({ name, sku, price, stock, category })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ data: product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar si el producto existe
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingProduct) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
    }

    // Eliminar el producto
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};