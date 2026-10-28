// index-loader.js — Societa Di Calcio (estilo Club 1984)

const GALERIA_CAMPAÑA = [
    'esquina-de-porteria.JPG',
    'black-subiendo-escaleras.jpg',
    'Playera Pasto.JPG',
    'Playera Espalda Parado.JPG',
    'Playera Espalda Agachado.JPG',
    'black-espaldas-barandal.jpg',
    'laverkusen-frente-negro.JPG',
    'black-subiendo-escaleras.jpg'
];

document.addEventListener('DOMContentLoaded', () => {
    cargarVitrinaDesdeServidor();
});

function escaparHTML(texto) {
    return String(texto == null ? '' : texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function cargarVitrinaDesdeServidor() {
    try {
        const respuesta = await fetch('/api/productos');
        if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
        const productos = await respuesta.json();
        console.log('Inventario recibido:', productos);

        renderizarCarrusel('new-in-carousel', productos);

        renderizarGaleria(productos);

        activarScrollCarrusel('new-in-carousel', 'newin-prev', 'newin-next');
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
    }
}

function renderizarCarrusel(contenedorId, productos) {
    const cont = document.getElementById(contenedorId);
    if (!cont) return;
    cont.innerHTML = '';

    productos.forEach(producto => {
        let totalStock = 0;
        if (producto.stock) totalStock = Object.values(producto.stock).reduce((a, b) => a + b, 0);
        const esProximamente = (totalStock === 0 || producto.status === 'coming_soon');

        const arrayFotos = producto.imagenes || [producto.imagen];
        const foto1 = arrayFotos[0] || 'logo SC sin fondo.png';

        let badgeHTML = '';
        if (esProximamente) badgeHTML = '<span class="product-card-badge">Próximamente</span>';
        else if (producto.oldPrice && producto.oldPrice > producto.precio) badgeHTML = '<span class="product-card-badge sale">Oferta</span>';
        else if (producto.categoria === 'novedades-cat') badgeHTML = '<span class="product-card-badge">Nuevo</span>';

        const linkDestino = esProximamente ? '#' : `product.html?product=${escaparHTML(producto.id)}`;

        // Size chips
        let sizesHTML = '';
        if (producto.stock && !esProximamente) {
            sizesHTML = Object.keys(producto.stock).map(talla => {
                const q = producto.stock[talla] || 0;
                const soldOut = q === 0 ? 'sold-out' : '';
                return `<span class="size-chip ${soldOut}">${escaparHTML(talla)}</span>`;
            }).join('');
        }

        const nombreSeguro = escaparHTML(producto.nombre);
        const fotoSegura = escaparHTML(foto1);
        const precio = esProximamente ? 'Próximamente' : `$${Number(producto.precio).toFixed(2)}`;

        const card = document.createElement('a');
        card.href = linkDestino;
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-card-image">
                ${badgeHTML}
                <img src="${fotoSegura}" alt="${nombreSeguro}" loading="lazy">
            </div>
            <div class="product-card-info">
                <div class="product-card-name">${nombreSeguro}</div>
                <div class="product-card-price">${precio}</div>
                <div class="product-card-sizes">${sizesHTML}</div>
            </div>`;
        cont.appendChild(card);
    });
}

function renderizarGaleria(productos) {
    const cont = document.getElementById('campaign-gallery');
    if (!cont) return;
    cont.innerHTML = '';

    const fotos = GALERIA_CAMPAÑA.length
        ? GALERIA_CAMPAÑA.map(src => ({ src, alt: 'Campaña Societa Di Calcio' }))
        : [];

    if (!fotos.length) {
        const lista = (productos || []).filter(p => p.status === 'active');
        const fuente = lista.length ? lista : (productos || []);
        fuente.forEach(producto => {
            const arrayFotos = producto.imagenes || [producto.imagen];
            arrayFotos.forEach(foto => {
                if (/\.(jpe?g|png|webp)$/i.test(String(foto))) {
                    fotos.push({ src: foto, alt: producto.nombre });
                }
            });
        });
    }

    fotos.slice(0, 8).forEach(({ src, alt }) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `<img src="${escaparHTML(src)}" alt="${escaparHTML(alt)}" loading="lazy">`;
        cont.appendChild(item);
    });
}

function activarScrollCarrusel(contenedorId, prevId, nextId) {
    const cont = document.getElementById(contenedorId);
    const prev = document.getElementById(prevId);
    const next = document.getElementById(nextId);
    if (!cont) return;
    const step = 280;
    if (prev) prev.addEventListener('click', () => cont.scrollBy({ left: -step, behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => cont.scrollBy({ left: step, behavior: 'smooth' }));
}