/* global require */
const fs = require('fs');
const https = require('https');
const d3 = require('d3-geo');
const topojson = require('topojson-client');

https.get('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const world = JSON.parse(data);
        const countries = topojson.feature(world, world.objects.countries);
        
        const projection = d3.geoEquirectangular().fitSize([1000, 500], countries);
        const path = d3.geoPath().projection(projection);
        const svgPath = path(countries);
        
        const egyptCoords = projection([30.8025, 26.8206]); 
        const mungoCoords = projection([143.0560, -33.7270]);
        const romeCoords = projection([12.4964, 41.9028]);
        const chinaCoords = projection([104.1954, 35.8617]);
        
        // ensure dir exists
        const dir = 'C:/Users/dmahe/OneDrive/Desktop/Archaeology-Dig-App/src/utils';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        
        const output = `export const WORLD_MAP_PATH = "${svgPath}";

export const SITE_COORDS = {
  egypt: { x: ${egyptCoords[0].toFixed(2)}, y: ${egyptCoords[1].toFixed(2)} },
  mungo: { x: ${mungoCoords[0].toFixed(2)}, y: ${mungoCoords[1].toFixed(2)} },
  rome: { x: ${romeCoords[0].toFixed(2)}, y: ${romeCoords[1].toFixed(2)} },
  china: { x: ${chinaCoords[0].toFixed(2)}, y: ${chinaCoords[1].toFixed(2)} }
};
`;
        
        fs.writeFileSync(dir + '/worldMapData.js', output);
        console.log('worldMapData.js generated successfully');
    });
});
