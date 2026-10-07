const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'docs', 'lonja');
const files = fs.readdirSync(dir);

files.forEach(f => {
  if (f.endsWith('.md')) {
    const p = path.join(dir, f);
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/ESTADO: PENDIENTE/g, 'ESTADO: COMPLETADO');
    fs.writeFileSync(p, c, 'utf8');
  }
});

console.log('Todos los documentos en docs/lonja marcados como COMPLETADO.');
