// CONFIGURACIÓN - REEMPLAZA CON TUS DATOS DE SUPABASE
const SB_URL = "https://zamaouqtwtiapibscmaf.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphbWFvdXF0d3RpYXBpYnNjbWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjY1ODMsImV4cCI6MjA4ODk0MjU4M30.Uzzr40xDGUyRYbnjoTFNt7ridzb8F1UFjBglo35coPE";

const client = supabase.createClient(
    SB_URL,
    SB_KEY
)

function base64ToArrayBuffer(base64) {
    var binaryString = atob(base64)
    var bytes = new Uint8Array(binaryString.length)
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
}

maplibregl.addProtocol('supabase', async (params, abortController) => {
    const re = new RegExp(/supabase:\/\/(.+)\/(\d+)\/(\d+)\/(\d+)/)
    const result = params.url.match(re)
    const { data, error } = await client.rpc('mvt', {
        relation: result[1],
        z: result[2],
        x: result[3],
        y: result[4],
    })
    const encoded = base64ToArrayBuffer(data)
    if (!error) {
        return { data: encoded }
    } else {
        throw new Error(`Tile fetch error:`)
    }
})

const map = new maplibregl.Map({
    hash: true,
    container: 'map',
    style: {
        version: 8,
        glyphs: 'https://cdn.protomaps.com/fonts/pbf/{fontstack}/{range}.pbf',
        sources: {
            supabase: {
                type: 'vector',
                tiles: ['supabase://places/{z}/{x}/{y}'],
                attribution:
                    '© <a href="https://overturemaps.org">Overture Maps Foundation</a>',
            },
            protomaps: {
                type: 'vector',
                // Get a Protomaps API key here: https://protomaps.com/dashboard
                // Or self-host Protomaps: https://docs.protomaps.com/pmtiles/cloud-storage
                url: 'https://api.protomaps.com/tiles/v3.json?key=1003762824b9687f',
                attribution:
                    'Basemap © <a href="https://openstreetmap.org">OpenStreetMap</a>',
            },
        },
        layers: [
            ...protomaps_themes_base.noLabels('protomaps', 'black'),
            {
                id: 'overture-pois',
                type: 'circle',
                source: 'supabase',
                'source-layer': 'places',
                paint: {
                    'circle-color': [
                        'case',
                        ['==', ['get', 'main_category'], 'beauty_salon'],
                        '#fb9a99',
                        ['==', ['get', 'main_category'], 'hotel'],
                        '#33a02c',
                        [
                            '==',
                            ['get', 'main_category'],
                            'landmark_and_historical_building',
                        ],
                        '#a6cee3',
                        ['==', ['get', 'main_category'], 'professional_services'],
                        '#fdbf6f',
                        ['==', ['get', 'main_category'], 'shopping'],
                        '#e31a1c',
                        ['==', ['get', 'main_category'], 'restaurant'],
                        '#1f78b4',
                        ['==', ['get', 'main_category'], 'school'],
                        '#ff7f00',
                        ['==', ['get', 'main_category'], 'accommodation'],
                        '#b2df8a',
                        '#cab2d6',
                    ],
                    'circle-radius': [
                        'interpolate',
                        ['exponential', 2],
                        ['zoom'],
                        0,
                        1,
                        19,
                        8,
                    ],
                    'circle-stroke-width': [
                        'interpolate',
                        ['exponential', 2],
                        ['zoom'],
                        12,
                        0,
                        14,
                        2,
                    ],
                    'circle-stroke-color': 'black',
                },
            },
            {
                id: 'overture-pois-text',
                type: 'symbol',
                source: 'supabase',
                'source-layer': 'places',
                layout: {
                    'text-field': '{primary_name}',
                    'text-font': ['Noto Sans Regular'],
                    'text-size': 10,
                },
                paint: {
                    'text-color': [
                        'case',
                        ['==', ['get', 'main_category'], 'beauty_salon'],
                        '#fb9a99',
                        ['==', ['get', 'main_category'], 'hotel'],
                        '#33a02c',
                        [
                            '==',
                            ['get', 'main_category'],
                            'landmark_and_historical_building',
                        ],
                        '#a6cee3',
                        ['==', ['get', 'main_category'], 'professional_services'],
                        '#fdbf6f',
                        ['==', ['get', 'main_category'], 'shopping'],
                        '#e31a1c',
                        ['==', ['get', 'main_category'], 'restaurant'],
                        '#1f78b4',
                        ['==', ['get', 'main_category'], 'school'],
                        '#ff7f00',
                        ['==', ['get', 'main_category'], 'accommodation'],
                        '#b2df8a',
                        '#cab2d6',
                    ],
                    'text-halo-width': 1,
                    'text-halo-color': 'black',
                },
            },
        ],
    },
})

const popup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: false,
    maxWidth: 'none',
})

function loadDetails(element, id) {
    element.innerHTML = 'loading...'
    client
        .from('colonia')
        .select('*'
        )
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
            if (error) return console.error(error)
            element.parentElement.innerHTML = `<pre>${JSON.stringify(
                data,
                null,
                2
            )}</pre>`
        })
}

map.on('click', 'overture-pois-text', async (e) => {
    if (e.features.length > 0) {
        const feature = e.features[0]
        console.log(feature)
        popup.setHTML(
            `
                        <table style="font-size:12px">
                            <tr>
                                <td>id:</td>
                                <td>${feature.properties.id}</td>
                            </tr>                           
                        </table>
                        `
        )
        popup.setLngLat(e.lngLat)
        popup.addTo(map)
    }
})
