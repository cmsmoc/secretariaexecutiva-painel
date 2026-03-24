/**
 * AUTOMAÇÃO NODE.JS (OPCIONAL)
 * Este script serve para o caso de você querer hospedar arquivos na pasta `/contents` 
 * e gerar um arquivo JSON estático de forma automatizada (sem usar Google Sheets), 
 * ou atualizar o Google Sheets via API.
 * * Execução: node sync.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const contentsDir = path.join(__dirname, 'contents');
const outputFile = path.join(__dirname, 'data.json');

function scanDirectory() {
    console.log('Iniciando varredura da pasta /contents...');
    
    if (!fs.existsSync(contentsDir)) {
        console.error('Pasta /contents não encontrada. Criando diretório...');
        fs.mkdirSync(contentsDir);
        return;
    }

    const files = fs.readdirSync(contentsDir);
    const database = [];

    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const stat = fs.statSync(path.join(contentsDir, file));
        
        // Ignora pastas
        if (stat.isDirectory()) return;

        let type = 'doc';
        if (ext === '.html' || ext === '.htm') type = 'html';
        if (ext === '.pdf') type = 'pdf';

        database.push({
            id: crypto.createHash('md5').update(file).digest('hex').substring(0, 8),
            title: file.replace(ext, '').replace(/-/g, ' '),
            type: type,
            url: `./contents/${file}`,
            thumbnail: '', // Opcional gerar thumb
            category: 'Local',
            tags: ext.replace('.', ''),
            featured: false,
            created_at: stat.birthtime.toISOString(),
            description: `Arquivo local importado via automação. Tamanho: ${(stat.size / 1024).toFixed(1)} KB`
        });
    });

    fs.writeFileSync(outputFile, JSON.stringify(database, null, 2));
    console.log(`\nSucesso! ${database.length} arquivos catalogados em data.json.`);
    console.log('Para usar, altere a variável API_URL no index.html para apontar para "data.json".');
}

scanDirectory();