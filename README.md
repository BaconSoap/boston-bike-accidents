1. put the converted-to-GeoJSON data at data/bikes_raw.json
2. `npm install && bower install`
3. `node scripts/to_simplified.js`
4. `node scripts/extract_filter_summary.js`
5. `node scripts/generate_filters.js`
6. modify `data/generated_filters.json` as needed
7. `gulp && gulp watch`