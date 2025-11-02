const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('=== API Request ===');
    console.log('Method:', req.method);
    console.log('Body:', req.body);

    // GET - Obtener todos los productos
    if (req.method === 'GET') {
      try {
        const { rows } = await sql`
          SELECT * FROM inventory_products 
          ORDER BY created_at DESC
        `;
        
        console.log('Productos encontrados:', rows.length);
        return res.status(200).json({ 
          success: true, 
          data: rows 
        });
      } catch (dbError) {
        console.error('Error en GET:', dbError);
        return res.status(500).json({ 
          success: false, 
          error: 'Error al obtener productos: ' + dbError.message 
        });
      }
    }

    // POST - Crear nuevo producto
    if (req.method === 'POST') {
      try {
        const { name, barcode, description, price, cost, stock, min_stock, category_name } = req.body;
        
        console.log('Datos recibidos:', { name, barcode, description, price, cost, stock, min_stock, category_name });
        
        // Validaciones
        if (!name || name.trim() === '') {
          return res.status(400).json({ 
            success: false, 
            error: 'El nombre es obligatorio' 
          });
        }

        if (!price || parseFloat(price) <= 0) {
          return res.status(400).json({ 
            success: false, 
            error: 'El precio debe ser mayor a 0' 
          });
        }

        // Insertar en la base de datos
        const { rows } = await sql`
          INSERT INTO inventory_products 
          (name, barcode, description, price, cost, stock, min_stock, category_name)
          VALUES (
            ${name}, 
            ${barcode || null}, 
            ${description || null}, 
            ${parseFloat(price)}, 
            ${parseFloat(cost) || 0}, 
            ${parseInt(stock) || 0}, 
            ${parseInt(min_stock) || 0}, 
            ${category_name || null}
          )
          RETURNING *
        `;
        
        console.log('Producto creado:', rows[0]);
        
        return res.status(201).json({ 
          success: true, 
          data: rows[0],
          message: 'Producto creado exitosamente'
        });
      } catch (dbError) {
        console.error('Error en POST:', dbError);
        return res.status(500).json({ 
          success: false, 
          error: 'Error al crear producto: ' + dbError.message 
        });
      }
    }

    // DELETE - Eliminar producto
    if (req.method === 'DELETE') {
      try {
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'ID del producto es requerido' 
          });
        }

        await sql`DELETE FROM inventory_products WHERE id = ${id}`;
        
        console.log('Producto eliminado, ID:', id);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Producto eliminado exitosamente' 
        });
      } catch (dbError) {
        console.error('Error en DELETE:', dbError);
        return res.status(500).json({ 
          success: false, 
          error: 'Error al eliminar producto: ' + dbError.message 
        });
      }
    }

    // Método no permitido
    return res.status(405).json({ 
      success: false, 
      error: 'Método no permitido: ' + req.method 
    });

  } catch (error) {
    console.error('Error general en API:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor: ' + error.message 
    });
  }
};