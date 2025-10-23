// services/productsService.js
const API_BASE_URL = 'http://localhost:3000/products';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bmtpdGNvcWJyd3Z0ZndrbXV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQ1MzU3MiwiZXhwIjoyMDc1MDI5NTcyfQ.slqQrZ5HFEqE9lftu_SYuDKQByFb0hILZzWy0j3yoj4';

class ProductsService {
    /**
     * Obtiene productos con paginación y formato
     */
    static async getProducts({ page = 1, limit = 12, accept = 'application/json' } = {}) {
        try {
            const url = `${API_BASE_URL}?page=${page}&limit=${limit}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-api-key': API_KEY,
                    'Accept': accept,
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (accept === 'application/json') {
                return await response.json();
            } else {
                return await response.text(); // XML
            }
        } catch (error) {
            console.error('Error obteniendo productos:', error);
            throw error;
        }
    }

    /**
     * Obtiene un producto por ID y formato
     */
    static async getProductById(id, accept = 'application/json') {
        try {
            const url = `${API_BASE_URL}/${id}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-api-key': API_KEY,
                    'Accept': accept,
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (accept === 'application/json') {
                return await response.json();
            } else {
                return await response.text(); // XML
            }
        } catch (error) {
            console.error('Error obteniendo producto:', error);
            throw error;
        }
    }
}

export default ProductsService;
