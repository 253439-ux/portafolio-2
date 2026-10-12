// dashboard-demo.js
// Misma lógica de render/animación que el proyecto real, pero los datos
// vienen de un objeto fijo en memoria en lugar de fetch() a un servidor.

const tbody = document.getElementById('tabla-body');

const formatearMoneda = (valor) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);
const formatearK = (valor) => valor >= 1000 ? `$${(valor / 1000).toFixed(1)}k` : `$${valor}`;

document.getElementById('today').textContent = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
});

const DATA_DEMO = {
    stats: {
        pedidosHoy: 14,
        ventasHoy: 3260,
        productosBajos: 3,
        clientes: 87
    },
    ventasSemana: [1800, 2400, 2100, 3000, 2600, 3600, 3260],
    pedidosEstado: {
        total: 24,
        nuevo: 6,
        enCurso: 5,
        listo: 4,
        entregado: 9
    },
    pedidosRecientes: [
        { id: 'PD-108', cliente: 'Marisol Pineda', producto: 'Pastel de chocolate 3 leches', fechaEntrega: '15 sep', estado: 'Nuevo', total: 480 },
        { id: 'PD-107', cliente: 'Jorge Nafate', producto: 'Docena de cupcakes red velvet', fechaEntrega: '15 sep', estado: 'En curso', total: 260 },
        { id: 'PD-106', cliente: 'Ana Lucía Gómez', producto: 'Pastel de boda 3 pisos', fechaEntrega: '16 sep', estado: 'En curso', total: 3200 },
        { id: 'PD-105', cliente: 'Roberto Culebro', producto: 'Galletas decoradas (x24)', fechaEntrega: '14 sep', estado: 'Listo', total: 340 },
        { id: 'PD-104', cliente: 'Fátima Ruiz', producto: 'Pastel de zanahoria', fechaEntrega: '13 sep', estado: 'Entregado', total: 390 },
    ]
};

function cargarDashboard() {
    // Simula una pequeña latencia de red para que se sienta real.
    setTimeout(() => {
        animarStats(DATA_DEMO.stats);
        renderTabla(DATA_DEMO.pedidosRecientes);
        renderGraficoVentas(DATA_DEMO.ventasSemana);
        renderGraficoDona(DATA_DEMO.pedidosEstado);
    }, 350);
}

function renderTabla(pedidos) {
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!pedidos || pedidos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--ink-soft); padding:20px;">
            No hay pedidos recientes.
        </td></tr>`;
        return;
    }

    pedidos.forEach((pedido, i) => {
        const tr = document.createElement('tr');

        const badgeClasses = {
            'nuevo': 'nuevo',
            'en curso': 'en-curso',
            'listo': 'listo',
            'entregado': 'entregado'
        };
        const estadoClase = badgeClasses[pedido.estado.toLowerCase()] || 'nuevo';

        tr.innerHTML = `
            <td>${pedido.id}</td>
            <td>${pedido.cliente}</td>
            <td>${pedido.producto}</td>
            <td>${pedido.fechaEntrega}</td>
            <td><span class="badge ${estadoClase}">${pedido.estado}</span></td>
            <td>${formatearMoneda(pedido.total)}</td>
        `;
        tr.classList.add('row-in');
        tr.style.animationDelay = (i * 45) + 'ms';
        tbody.appendChild(tr);
    });
}

function renderGraficoVentas(ventasArray) {
    if (!ventasArray || ventasArray.length !== 7) return;

    const maxVenta = Math.max(...ventasArray, 100);

    document.getElementById('lbl-max').textContent = formatearK(maxVenta);
    document.getElementById('lbl-mid').textContent = formatearK(maxVenta / 2);

    const xPos = [70, 150, 230, 310, 390, 470, 540];

    const points = ventasArray.map((venta, i) => {
        const y = 180 - ((venta / maxVenta) * 160);
        return `${xPos[i]},${y}`;
    });

    const pointsStr = points.join(' ');
    const polygonPoints = `${pointsStr} 540,180 70,180`;

    const polygon = document.getElementById('chart-polygon');
    const linea = document.getElementById('chart-line');
    const gPoints = document.getElementById('chart-points');

    if (!polygon || !linea || !gPoints) return;

    polygon.setAttribute('points', polygonPoints);
    linea.setAttribute('points', pointsStr);

    gPoints.innerHTML = '';
    ventasArray.forEach((venta, i) => {
        const y = 180 - ((venta / maxVenta) * 160);
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", xPos[i]);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", "4");
        circle.classList.add('chart-dot');
        circle.style.transitionDelay = (650 + i * 70) + 'ms';
        gPoints.appendChild(circle);
    });

    const svg = polygon.ownerSVGElement;
    svg.querySelectorAll('.eje-titulo').forEach(el => el.remove());

    const tituloEjeY = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tituloEjeY.setAttribute('transform', 'translate(-15, 90) rotate(-90)');
    tituloEjeY.setAttribute('font-size', '11');
    tituloEjeY.setAttribute('font-weight', '600');
    tituloEjeY.setAttribute('fill', '#9c968e');
    tituloEjeY.setAttribute('font-family', 'Poppins');
    tituloEjeY.setAttribute('text-anchor', 'middle');
    tituloEjeY.classList.add('eje-titulo');
    tituloEjeY.textContent = 'Valores (Monto en MXN)';
    svg.appendChild(tituloEjeY);

    const tituloEjeX = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tituloEjeX.setAttribute('x', '305');
    tituloEjeX.setAttribute('y', '230');
    tituloEjeX.setAttribute('font-size', '11');
    tituloEjeX.setAttribute('font-weight', '600');
    tituloEjeX.setAttribute('fill', '#9c968e');
    tituloEjeX.setAttribute('font-family', 'Poppins');
    tituloEjeX.setAttribute('text-anchor', 'middle');
    tituloEjeX.classList.add('eje-titulo');
    tituloEjeX.textContent = 'Categorías (Días de la semana)';
    svg.appendChild(tituloEjeX);

    polygon.style.opacity = '0';

    requestAnimationFrame(() => requestAnimationFrame(() => {
        const len = linea.getTotalLength();
        linea.style.strokeDasharray = len;
        linea.style.strokeDashoffset = len;
        linea.getBoundingClientRect();
        linea.style.strokeDashoffset = '0';

        polygon.style.opacity = '1';

        gPoints.querySelectorAll('.chart-dot').forEach(d => d.classList.add('is-visible'));
    }));
}

function renderGraficoDona(estados) {
    if (!estados) return;

    const circ = 439.82;
    const total = estados.total || 1;

    contarHasta('donut-total', estados.total || 0, v => Math.round(v));
    contarHasta('leg-nuevo', estados.nuevo || 0, v => Math.round(v));
    contarHasta('leg-curso', estados.enCurso || 0, v => Math.round(v));
    contarHasta('leg-listo', estados.listo || 0, v => Math.round(v));
    contarHasta('leg-entregado', estados.entregado || 0, v => Math.round(v));

    let offsetActual = 0;
    const segmentos = [
        { id: 'donut-nuevo', valor: estados.nuevo || 0 },
        { id: 'donut-curso', valor: estados.enCurso || 0 },
        { id: 'donut-listo', valor: estados.listo || 0 },
        { id: 'donut-entregado', valor: estados.entregado || 0 },
    ];

    segmentos.forEach((seg, i) => {
        const el = document.getElementById(seg.id);
        if (!el) return;

        const pct = seg.valor / total;
        const dash = pct * circ;

        el.setAttribute('stroke-dashoffset', -offsetActual);
        el.setAttribute('stroke-dasharray', `0 ${circ}`);

        setTimeout(() => {
            el.setAttribute('stroke-dasharray', `${dash} ${circ}`);
        }, i * 130);

        offsetActual += dash;
    });
}

function contarHasta(id, valorFinal, formatear) {
    const el = document.getElementById(id);
    if (!el) return;
    const duracion = 700;
    const inicio = performance.now();

    function tick(ahora) {
        const progreso = Math.min((ahora - inicio) / duracion, 1);
        const facilitado = 1 - Math.pow(1 - progreso, 3);
        el.textContent = formatear(valorFinal * facilitado);
        if (progreso < 1) requestAnimationFrame(tick);
        else el.textContent = formatear(valorFinal);
    }
    requestAnimationFrame(tick);
}

function animarStats(stats) {
    if (!stats) return;
    contarHasta('stat-pedidos', stats.pedidosHoy || 0, v => Math.round(v));
    contarHasta('stat-ventas', stats.ventasHoy || 0, formatearMoneda);
    contarHasta('stat-bajos', stats.productosBajos || 0, v => Math.round(v));
    contarHasta('stat-clientes', stats.clientes || 0, v => Math.round(v));
}

// Navegación del sidebar: los módulos no incluidos en la demo muestran un
// toast en vez de un link roto.
document.querySelectorAll('[data-toast]').forEach(el => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        window.mostrarToast(el.getAttribute('data-toast'));
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('user_name');
    const nameDisplay = document.getElementById('user-name-display');
    if (nameDisplay && userName) nameDisplay.textContent = userName;

    cargarDashboard();
});
