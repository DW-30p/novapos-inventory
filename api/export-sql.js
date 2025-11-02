const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('Exportando productos...');
    
    const { rows } = await sql`
      SELECT * FROM inventory_products 
      ORDER BY category_name, name
    `;

    console.log('Productos a exportar:', rows.length);

    // Generar SQL compatible con tu estructura de Colmado Gerardo
    let sqlOutput = '-- =====================================================\n';
    sqlOutput += '-- EXPORTACIÓN DE INVENTARIO - COLMADO GERARDO\n';
    sqlOutput += `-- Fecha: ${new Date().toLocaleString('es-DO')}\n`;
    sqlOutput += `-- Total de productos: ${rows.length}\n`;
    sqlOutput += '-- =====================================================\n\n';

    // Obtener categorías únicas
    const categories = [...new Set(rows.map(p => p.category_name).filter(Boolean))];
    
    if (categories.length > 0) {
      sqlOutput += '-- Insertar categorías\n';
      categories.forEach((cat) => {
        sqlOutput += `INSERT INTO categories (name, description) VALUES ('${cat.replace(/'/g, "''")}', 'Importado desde inventario');\n`;
      });
      sqlOutput += '\n';
    }

    sqlOutput += '-- Insertar productos\n';
    rows.forEach((product) => {
      const categoryClause = product.category_name 
        ? `(SELECT id FROM categories WHERE name = '${product.category_name.replace(/'/g, "''")}')`
        : 'NULL';

      sqlOutput += `INSERT INTO products (name, description, price, cost, stock, min_stock, barcode, category_id, available) VALUES (`;
      sqlOutput += `'${product.name.replace(/'/g, "''")}', `;
      sqlOutput += `${product.description ? `'${product.description.replace(/'/g, "''")}'` : 'NULL'}, `;
      sqlOutput += `${product.price}, `;
      sqlOutput += `${product.cost || 0}, `;
      sqlOutput += `${product.stock || 0}, `;
      sqlOutput += `${product.min_stock || 0}, `;
      sqlOutput += `${product.barcode ? `'${product.barcode}'` : 'NULL'}, `;
      sqlOutput += `${categoryClause}, `;
      sqlOutput += `TRUE);\n`;
    });

    sqlOutput += '\n-- =====================================================\n';
    sqlOutput += '-- FIN DE LA EXPORTACIÓN\n';
    sqlOutput += '-- =====================================================\n';

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=inventario_colmado_${Date.now()}.sql`);
    return res.status(200).send(sqlOutput);

  } catch (error) {
    console.error('Error al exportar:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error al exportar: ' + error.message 
    });
  }
};