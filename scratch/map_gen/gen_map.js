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
        
        // Define projection and path generator
        // viewBox 0 0 1000 500
        const projection = d3.geoEquirectangular().fitSize([1000, 500], countries);
        const path = d3.geoPath().projection(projection);
        
        const svgPath = path(countries);
        fs.writeFileSync('map_path.txt', svgPath);
        console.log('Path generated successfully, length:', svgPath.length);
    });
});
