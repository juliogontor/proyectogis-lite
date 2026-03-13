// CONFIGURACIÓN - REEMPLAZA CON TUS DATOS DE SUPABASE
const SB_URL = "https://zamaouqtwtiapibscmaf.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbWFvdXF0d3RpYXBpYnNjbWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjY1ODMsImV4cCI6MjA4ODk0MjU4M30.Uzzr40xDGUyRYbnjoTFNt7ridzb8F1UFjBglo35coPE"; 

// Inicializar Mapa
const map = L.map('map').setView([20.85, -103.75], 13);

// Capa Base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// URL de la función RPC para MVT
const mvtUrl = `${SB_URL}/rest/v1/rpc/get_colonia_mvt?x={x}&y={y}&z={z}`;

// Estilo de la capa de parcelas (M3) [cite: 36]
const vectorTileOptions = {
    interactive: true,
    vectorTileLayerStyles: {
        "colonia": { // <--- DEBE coincidir con el segundo parámetro de ST_AsMVT en el SQL
            fill: true,
            fillColor: '#2ecc71',
            fillOpacity: 0.5,
            color: '#27ae60',
            weight: 2
        }
    },
    fetchOptions: {
        headers: {
            "apikey": SB_KEY,
            "Authorization": `Bearer ${SB_KEY}`,
            "Accept": "application/vnd.pgrst.object+octet-stream", // <--- AGREGA ESTO
            "X-Client-Info": "supabase-js/2.0.0"
        }
    }
};

// Cargar Capa Vectorial (M3)
const mvtLayer = L.vectorGrid.protobuf(mvtUrl, vectorTileOptions).addTo(map);

// Interactividad básica (M4: Ficha de información rápida) [cite: 38]
mvtLayer.on('click', function(e) {
    const properties = e.layer.properties;
    L.popup()
        .setLatLng(e.latlng)
        .setContent(`<b>ID Colonia:</b> ${properties.id}`)
        .openOn(map);
});