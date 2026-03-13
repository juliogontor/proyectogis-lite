// CONFIGURACIÓN - REEMPLAZA CON TUS DATOS DE SUPABASE
const SB_URL = "https://zamaouqtwtiapibscmaf.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbWFvdXF0d3RpYXBpYnNjbWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjY1ODMsImV4cCI6MjA4ODk0MjU4M30.Uzzr40xDGUyRYbnjoTFNt7ridzb8F1UFjBglo35coPE";

// Inicializar Mapa
const map = L.map('map').setView([20.85, -103.75], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// 3. MIDDLEWARE PARA BASE64 -> BINARIO
// Esto soluciona el problema de los Media Types de Supabase
async function fetchMvtAsBase64(url) {
    const response = await fetch(url, {
        headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` }
    });
    const json = await response.json();
    const base64String = json;

    if (!base64String) return null;

    const binaryString = window.atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // DECODIFICACIÓN
    try {
        const pbf = new Pbf(bytes);
        // Intentamos con vectorTile global
        const vtProvider = window.VectorTile || window.vectorTile || (window.Mapbox && window.Mapbox.VectorTile);

        if (!vtProvider) {
            console.error("Error: No se encontró la librería VectorTile en window.");
            return null;
        }

        // Si vtProvider es la clase directa, la usamos, si no, buscamos .VectorTile dentro
        const tile = (typeof vtProvider.VectorTile === 'function')
            ? new vtProvider.VectorTile(pbf)
            : new vtProvider(pbf);
    } catch (e) {
        console.error("Error decodificando el PBF:", e);
        return null;
    }
}

// 4. EXTENSIÓN PERSONALIZADA DE VECTORGRID
// Sobrescribimos el cargador para usar nuestra función de Base64
const CustomVectorLayer = L.VectorGrid.Protobuf.extend({
    _getVectorTilePromise: function (coords) {
        const x = coords.x, y = coords.y, z = coords.z;
        const url = `${SB_URL}/rest/v1/rpc/get_colonia_mvt2?x=${x}&y=${y}&z=${z}`;

        return fetchMvtAsBase64(url).then(buffer => {
            if (!buffer) return null;
            return buffer;
        });
    }
});

// 5. CARGAR LA CAPA
const vectorTileOptions = {
    interactive: true,
    vectorTileLayerStyles: {
        sliced: function (properties, zoom, layerName) {
            console.log("Renderizando capa detectada:", layerName);
            return {
                fill: true,
                fillColor: '#ff0000', // Rojo brillante para que no haya duda
                fillOpacity: 0.5,
                color: '#ffffff',
                weight: 2,
                opacity: 1
            };
        }
    }
};

// 3. Este es el truco: VectorGrid no soporta Base64 nativo, 
// así que "engañamos" al cargador o usamos una petición manual si es necesario.
// Cargar Capa Vectorial (M3)
const mvtLayer = new CustomVectorLayer("", vectorTileOptions).addTo(map);

// 6. POPUP AL HACER CLIC
mvtLayer.on('click', function (e) {
    const props = e.layer.properties;
    L.popup()
        .setLatLng(e.latlng)
        .setContent(`<b>Colonia ID:</b> ${props.id || 'N/A'}`)
        .openOn(map);
});