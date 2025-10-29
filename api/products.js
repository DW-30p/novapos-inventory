const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Obtener todos los productos
    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT * FROM inventory_products 
        ORDER BY created_at DESC
      `;
      return res.status(200).json({ success: true, data: rows });
    }

    // POST - Crear nuevo producto
    if (req.method === 'POST') {
      const { name, barcode, description, price, cost, stock, min_stock, category_name } = req.body;
      
      const { rows } = await sql`
        INSERT INTO inventory_products 
        (name, barcode, description, price, cost, stock, min_stock, category_name)
        VALUES (${name}, ${barcode || null}, ${description || null}, ${price}, ${cost || 0}, ${stock || 0}, ${min_stock || 0}, ${category_name || null})
        RETURNING *
      `;
      
      return res.status(201).json({ success: true, data: rows[0] });
    }

    // DELETE - Eliminar producto
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      await sql`DELETE FROM inventory_products WHERE id = ${id}`;
      
      return res.status(200).json({ success: true, message: 'Producto eliminado' });
    }

    return res.status(405).json({ error: 'Método no permitido' });

  } catch (error) {
    console.error('Error en API:', error);
    return res.status(500).json({ error: error.message });
  }
};