import './App.css'
import { Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import ProductsService from '../src/services/productsService';

const PAGE_SIZES = [6, 12, 24, 48];
const SORT_OPTIONS = [
  { value: 'name:asc', label: 'Nombre Ascendente' },
  { value: 'name:desc', label: 'Nombre Descendente' },
  { value: 'price:asc', label: 'Precio Ascendente' },
  { value: 'price:desc', label: 'Precio Descendente' },
];

function App() {
  // Convierte XML string a array de productos JS
  function parseProductsXML(xmlString) {
    // Extrae todos los <data>...</data> usando regex, ignora errores de formato
    const dataRegex = /<data>([\s\S]*?)<\/data>/g;
    const productsArr = [];
    let match;
    while ((match = dataRegex.exec(xmlString)) !== null) {
      const dataContent = match[1];
      // Extrae campos dentro de <data>
      const fieldRegex = /<([a-zA-Z0-9_]+)>([\s\S]*?)<\/\1>/g;
      const obj = {};
      let fieldMatch;
      while ((fieldMatch = fieldRegex.exec(dataContent)) !== null) {
        obj[fieldMatch[1]] = fieldMatch[2];
      }
      productsArr.push(obj);
    }
    // Paginación (opcional)
    const pagination = {};
    const pagMatch = /<pagination>([\s\S]*?)<\/pagination>/.exec(xmlString);
    if (pagMatch) {
      const pagContent = pagMatch[1];
      const pagFieldRegex = /<([a-zA-Z0-9_]+)>([\s\S]*?)<\/\1>/g;
      let pagFieldMatch;
      while ((pagFieldMatch = pagFieldRegex.exec(pagContent)) !== null) {
        pagination[pagFieldMatch[1]] = pagFieldMatch[2];
      }
    }
    return { products: productsArr, pagination };
  }
  // Renderiza propiedades de objetos anidados de forma amigable
  function renderDetails(obj, level = 0) {
    if (obj === null) return <span>null</span>;
    if (typeof obj !== 'object') return <span>{String(obj)}</span>;
    if (Array.isArray(obj)) {
      return (
        <ul style={{ marginLeft: level * 16 }}>
          {obj.map((item, idx) => (
            <li key={idx}>{renderDetails(item, level + 1)}</li>
          ))}
        </ul>
      );
    }
    return (
      <div style={{ marginLeft: level * 16 }}>
        {Object.entries(obj).map(([key, value]) => (
          <div key={key}><strong>{key}:</strong> {renderDetails(value, level + 1)}</div>
        ))}
      </div>
    );
  }
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [detailRaw, setDetailRaw] = useState(false);
  const [detailRawData, setDetailRawData] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [accept, setAccept] = useState('application/json');
  const [sort, setSort] = useState('name:asc');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    ProductsService.getProducts({ page, limit: pageSize, accept })
      .then(data => {
        if (!isMounted) return;
        if (accept === 'application/xml') {
          const { products: xmlProducts } = parseProductsXML(data);
          console.log('Productos XML:', xmlProducts);
          console.log('Cantidad XML:', xmlProducts.length);
          setProducts(xmlProducts);
        } else {
          const productos = data.data || [];
          console.log('Productos JSON:', productos);
          console.log('Cantidad JSON:', productos.length);
          setProducts(productos);
        }
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        setError('Error al cargar productos: ' + err.message);
        setProducts([]);
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, [page, pageSize, accept]);

  // Handlers para modal de detalle
  async function handleOpenDetail(id) {
    setSelectedProduct(null);
    setDetailLoading(true);
    setDetailError(null);
    setDetailRaw(false);
    setDetailRawData('');
    try {
      const acceptType = accept;
      const data = await ProductsService.getProductById(id, acceptType);
      if (acceptType === 'application/json') {
        setSelectedProduct(data);
        setDetailRawData(JSON.stringify(data, null, 2));
      } else {
        // XML: parsear y mostrar amigable y raw
        setDetailRawData(data);
        // Buscar el producto por id en el XML
        const { products: xmlProducts } = parseProductsXML(data);
        const found = xmlProducts.find(p => p.id === id || p.ID === id);
        setSelectedProduct(found || null);
      }
    } catch (err) {
      setDetailError('Error al cargar detalle: ' + err.message);
      setSelectedProduct(null);
      setDetailRawData('');
    }
    setDetailLoading(false);
  }

  function handleCloseDetail() {
    setSelectedProduct(null);
    setDetailRaw(false);
    setDetailRawData('');
    setDetailError(null);
    setDetailLoading(false);
  }

  // Ordenamiento en memoria
  const sortedProducts = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    const [field, direction] = sort.split(':');
    return [...products].sort((a, b) => {
      // Convertir valores numéricos si es necesario
      const aName = a.name || a.NAME || a.Nombre || a.nombre || '';
      const bName = b.name || b.NAME || b.Nombre || b.nombre || '';
      const aPrice = parseFloat(a.price || a.PRECIO || a.precio || 0);
      const bPrice = parseFloat(b.price || b.PRECIO || b.precio || 0);
      if (field === 'name') {
        if (aName < bName) return direction === 'asc' ? -1 : 1;
        if (aName > bName) return direction === 'asc' ? 1 : -1;
        return 0;
      }
      if (field === 'price') {
        return direction === 'asc' ? aPrice - bPrice : bPrice - aPrice;
      }
      return 0;
    });
  }, [products, sort]);

  // Skeletons
  const skeletons = Array(pageSize).fill(null);

  return (
    <div>
      <h1>Products</h1>
      <div className="controls-bar">
        <div className="container-controls">
          <label htmlFor="select-format">
            Formato:
          </label>
          <select id="select-format" value={accept} onChange={e => { setAccept(e.target.value); setPage(1); }}>
            <option value="application/json">JSON</option>
            <option value="application/xml">XML</option>
          </select>
        </div>
        <div className="container-controls">
          <label htmlFor="select-pagesize">
            Tamaño de página:
          </label>
          <select id="select-pagesize" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
            {PAGE_SIZES.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <div className="container-controls">
          <label htmlFor="select-sort">
            Ordenar por:
          </label>
          <select id="select-sort" value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="products-grid">
          {skeletons.map((_, i) => (
            <div key={i} className="product-skeleton" />
          ))}
        </div>
      )}

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!loading && !error && (
        <div>
          {sortedProducts.length === 0 ? (
            <div>No hay productos para mostrar.</div>
          ) : (
            <div className="products-grid">
              {sortedProducts.map((product, idx) => (
                <div key={product.id || idx} className="product-card" onClick={() => handleOpenDetail(product.id || product.ID || product.sku || idx)} style={{ cursor: 'pointer' }}>
                  <strong>{product.name || product.NAME || product.Nombre || product.nombre}</strong>
                  <div>Precio: ${product.price || product.PRECIO || product.precio || ''}</div>
                  <div>SKU: {product.sku || product.SKU || product.sku || ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}



      {/* Modal de detalle de producto */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={handleCloseDetail}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-toggle">
            <button className="modal-button" onClick={handleCloseDetail}>x</button>
          </div>
            {detailLoading ? (
              <div className="modal-loading">Cargando detalle...</div>
            ) : detailError ? (
              <div className="modal-error" role="alert">{detailError}</div>
            ) : (
              <>

                {detailRaw ? (
                  <pre className="raw-view">{detailRawData}</pre>
                ) : (
                  <div className="modal-details">
                    {selectedProduct ? renderDetails(selectedProduct) : <div>No hay datos para mostrar.</div>}
                  </div>
                )}

                <div className="modal-toggle">
                  <button onClick={() => setDetailRaw(r => !r)}>
                    {detailRaw ? 'Vista amigable' : 'Vista Raw'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}



      {/* Paginación simple */}
      <div className="pagination-bar">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
        <span>Página {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={products.length < pageSize}>Siguiente</button>
      </div>
    </div>
  );
}

export default App
