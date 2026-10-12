// ============================================================
// ELEMENTOS DEL DOM
// ============================================================

const functionInput = document.getElementById("functionInput");
const lowerInput = document.getElementById("lowerInput");
const upperInput = document.getElementById("upperInput");
const intervalInput = document.getElementById("intervalInput");
const methodSelect = document.getElementById("methodSelect");

const calculateButton = document.getElementById("calculateButton");

const resultValue = document.getElementById("resultValue");
const deltaValue = document.getElementById("deltaValue");
const rectangleValue = document.getElementById("rectangleValue");

const methodLabel = document.getElementById("methodLabel");
const graphDescription = document.getElementById("graphDescription");

const errorBox = document.getElementById("errorBox");
const errorMessage = document.getElementById("errorMessage");

const formulaText = document.getElementById("formulaText");
const deltaExplanation = document.getElementById("deltaExplanation");
const methodExplanation = document.getElementById("methodExplanation");


// ============================================================
// FUNCIONES MATEMÁTICAS PERMITIDAS
//
// El usuario NO puede ejecutar código JavaScript.
// La función se analiza utilizando el árbol sintáctico
// de Math.js y únicamente dejamos pasar operaciones y
// funciones matemáticas explícitamente permitidas.
// ============================================================

const allowedFunctions = new Set([
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "sqrt",
    "abs",
    "log",
    "log10",
    "exp",
    "floor",
    "ceil",
    "round",
    "sign"
]);


const allowedSymbols = new Set([
    "x",
    "pi",
    "e"
]);


/**
 * Analiza una expresión matemática y valida sus nodos.
 *
 * Ejemplos válidos:
 * x^2
 * sin(x)
 * 2*x + 1
 * sqrt(x)
 *
 * Se rechazan asignaciones, objetos, accesos a propiedades,
 * funciones desconocidas, etc.
 */
function compileSafeFunction(expression) {

    let node;

    try {
        node = math.parse(expression);
    } catch {
        throw new Error("La función matemática no tiene un formato válido.");
    }


    node.traverse(function(currentNode) {

        const type = currentNode.type;

        const permittedNodeTypes = new Set([
            "OperatorNode",
            "ConstantNode",
            "SymbolNode",
            "FunctionNode",
            "ParenthesisNode"
        ]);


        if (!permittedNodeTypes.has(type)) {
            throw new Error(
                "La expresión contiene elementos no permitidos."
            );
        }


        // Validar símbolos como x, pi y e.
        if (type === "SymbolNode") {

            /*
             * Cuando un símbolo es el nombre de una función,
             * Math.js también puede incluirlo durante el recorrido.
             */
            if (
                !allowedSymbols.has(currentNode.name) &&
                !allowedFunctions.has(currentNode.name)
            ) {
                throw new Error(
                    `El símbolo "${currentNode.name}" no está permitido.`
                );
            }

        }


        // Validar llamadas a funciones.
        if (type === "FunctionNode") {

            const functionName = currentNode.fn?.name;

            if (!allowedFunctions.has(functionName)) {
                throw new Error(
                    `La función "${functionName || "desconocida"}" no está permitida.`
                );
            }

        }

    });


    const compiled = node.compile();


    /*
     * Devolvemos una función normal f(x).
     */
    return function(x) {

        const value = compiled.evaluate({
            x: x,
            pi: Math.PI,
            e: Math.E
        });


        if (
            typeof value !== "number" ||
            !Number.isFinite(value)
        ) {
            throw new Error(
                "La función produce valores no reales o indefinidos en el intervalo."
            );
        }

        return value;
    };
}


// ============================================================
// NOMBRE DEL MÉTODO
// ============================================================

function getMethodName(method) {

    const names = {
        left: "Izquierda",
        right: "Derecha",
        middle: "Punto medio"
    };

    return names[method] || "Desconocido";
}


// ============================================================
// MOSTRAR ERROR
// ============================================================

function showError(message) {

    errorMessage.textContent = message;

    errorBox.classList.remove("hidden");

    errorBox.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


// ============================================================
// OCULTAR ERROR
// ============================================================

function hideError() {
    errorBox.classList.add("hidden");
}


// ============================================================
// OBTENER Y VALIDAR DATOS
// ============================================================

function getFormData() {

    const expression = functionInput.value.trim();

    const a = Number(lowerInput.value);
    const b = Number(upperInput.value);

    const n = Number(intervalInput.value);

    const method = methodSelect.value;


    if (!expression) {
        throw new Error(
            "Ingresa una función matemática."
        );
    }


    if (
        lowerInput.value.trim() === "" ||
        upperInput.value.trim() === ""
    ) {
        throw new Error(
            "Ingresa ambos límites del intervalo."
        );
    }


    if (
        !Number.isFinite(a) ||
        !Number.isFinite(b)
    ) {
        throw new Error(
            "Los límites deben ser números válidos."
        );
    }


    if (a >= b) {
        throw new Error(
            "El límite superior debe ser mayor que el límite inferior."
        );
    }


    if (!Number.isInteger(n)) {
        throw new Error(
            "El número de subintervalos debe ser un número entero."
        );
    }


    if (n < 1) {
        throw new Error(
            "Debe existir al menos un subintervalo."
        );
    }


    if (n > 200) {
        throw new Error(
            "Utiliza como máximo 200 subintervalos para mantener una visualización clara."
        );
    }


    return {
        expression,
        a,
        b,
        n,
        method
    };
}


// ============================================================
// CALCULAR SUMA DE RIEMANN
// ============================================================

function calculateRiemann(func, a, b, n, method) {

    /*
     * El ancho de cada subintervalo es:
     *
     *              b - a
     *      Δx = -----------
     *                n
     */
    const dx = (b - a) / n;


    let sum = 0;

    const rectangles = [];


    /*
     * Recorremos los n subintervalos:
     *
     * [x0, x1], [x1, x2], ..., [xn-1, xn]
     */
    for (let i = 0; i < n; i++) {

        const xLeft = a + i * dx;

        const xRight = xLeft + dx;


        let sampleX;


        /*
         * Seleccionamos el punto donde evaluaremos f(x)
         * dependiendo del método elegido.
         */
        if (method === "left") {

            sampleX = xLeft;

        } else if (method === "right") {

            sampleX = xRight;

        } else {

            // Punto medio:
            //
            // x* = (x izquierda + x derecha) / 2

            sampleX = (xLeft + xRight) / 2;
        }


        const height = func(sampleX);


        /*
         * Área del rectángulo:
         *
         *     A = base × altura
         *
         *     A = Δx × f(x*)
         */
        const rectangleArea = dx * height;


        sum += rectangleArea;


        rectangles.push({
            xLeft,
            xRight,
            sampleX,
            height,
            area: rectangleArea
        });
    }


    return {
        sum,
        dx,
        rectangles
    };
}


// ============================================================
// GENERAR DATOS DE LA CURVA
// ============================================================

function generateCurve(func, a, b) {

    const xValues = [];
    const yValues = [];


    /*
     * Tomamos bastantes puntos para que la curva se vea suave.
     */
    const points = 600;


    for (let i = 0; i <= points; i++) {

        const x = a + (b - a) * (i / points);

        let y;

        try {
            y = func(x);
        } catch {

            /*
             * Plotly interpreta null como una discontinuidad,
             * evitando conectar dos segmentos inválidos.
             */
            y = null;
        }


        xValues.push(x);
        yValues.push(y);
    }


    return {
        xValues,
        yValues
    };
}


// ============================================================
// CREAR GRÁFICA
// ============================================================

function drawGraph(
    func,
    expression,
    a,
    b,
    rectangles,
    method
) {

    const curve = generateCurve(func, a, b);


    /*
     * RECTÁNGULOS
     *
     * Plotly permite añadir formas directamente a la gráfica.
     *
     * Cada rectángulo empieza en y = 0 y termina en
     * y = f(x*) donde x* depende del método seleccionado.
     */
    const shapes = rectangles.map((rectangle) => {

        return {
            type: "rect",

            xref: "x",
            yref: "y",

            x0: rectangle.xLeft,
            x1: rectangle.xRight,

            y0: 0,
            y1: rectangle.height,

            line: {
                color: "rgba(79, 70, 229, 0.80)",
                width: 1.2
            },

            fillcolor: "rgba(99, 102, 241, 0.22)",

            layer: "below"
        };

    });


    /*
     * Puntos donde se evalúa cada rectángulo.
     */
    const sampleX = rectangles.map(
        rectangle => rectangle.sampleX
    );

    const sampleY = rectangles.map(
        rectangle => rectangle.height
    );


    const sampleInformation = rectangles.map(
        (rectangle, index) => {

            return (
                `Rectángulo ${index + 1}` +
                `<br>x* = ${formatNumber(rectangle.sampleX, 5)}` +
                `<br>f(x*) = ${formatNumber(rectangle.height, 5)}` +
                `<br>Área = ${formatNumber(rectangle.area, 5)}`
            );

        }
    );


    // Línea principal de la función
    const functionTrace = {

        x: curve.xValues,
        y: curve.yValues,

        type: "scatter",
        mode: "lines",

        name: `f(x) = ${expression}`,

        line: {
            color: "#4f46e5",
            width: 3
        },

        hovertemplate:
            "x = %{x:.4f}<br>" +
            "f(x) = %{y:.4f}" +
            "<extra></extra>"
    };


    // Puntos de evaluación
    const pointTrace = {

        x: sampleX,
        y: sampleY,

        type: "scatter",
        mode: "markers",

        name: "Puntos de evaluación",

        marker: {
            color: "#312e81",
            size: rectangles.length > 50 ? 4 : 6
        },

        text: sampleInformation,

        hovertemplate:
            "%{text}" +
            "<extra></extra>"
    };


    const layout = {

        margin: {
            l: 65,
            r: 30,
            t: 30,
            b: 60
        },

        paper_bgcolor: "#ffffff",

        plot_bgcolor: "#ffffff",


        xaxis: {

            title: {
                text: "x",
                font: {
                    color: "#64748b"
                }
            },

            range: [
                a - (b - a) * 0.05,
                b + (b - a) * 0.05
            ],

            gridcolor: "#f1f5f9",

            zerolinecolor: "#94a3b8",

            tickfont: {
                color: "#64748b"
            }
        },


        yaxis: {

            title: {
                text: "f(x)",
                font: {
                    color: "#64748b"
                }
            },

            gridcolor: "#f1f5f9",

            zerolinecolor: "#64748b",

            tickfont: {
                color: "#64748b"
            }
        },


        shapes: shapes,


        showlegend: false,


        hovermode: "closest",


        font: {
            family: "Inter, sans-serif",
            color: "#475569"
        },


        dragmode: "pan"
    };


    const config = {

        responsive: true,

        displaylogo: false,

        scrollZoom: true,

        modeBarButtonsToRemove: [
            "lasso2d",
            "select2d"
        ]
    };


    Plotly.react(
        "graph",
        [
            functionTrace,
            pointTrace
        ],
        layout,
        config
    );


    graphDescription.textContent =
        `f(x) = ${expression} · Intervalo [${a}, ${b}] · ${getMethodName(method)}`;
}


// ============================================================
// FORMATEAR NÚMEROS
// ============================================================

function formatNumber(value, decimals = 6) {

    if (!Number.isFinite(value)) {
        return "—";
    }


    /*
     * Notación científica para números demasiado grandes
     * o demasiado pequeños.
     */
    if (
        Math.abs(value) >= 1e7 ||
        (
            Math.abs(value) < 1e-5 &&
            value !== 0
        )
    ) {
        return value.toExponential(5);
    }


    return Number(
        value.toFixed(decimals)
    ).toLocaleString("es-MX", {
        maximumFractionDigits: decimals
    });
}


// ============================================================
// ACTUALIZAR INFORMACIÓN DE RESULTADOS
// ============================================================

function updateResults(data, calculation) {

    const {
        expression,
        a,
        b,
        n,
        method
    } = data;


    const {
        sum,
        dx
    } = calculation;


    resultValue.textContent =
        formatNumber(sum, 6);


    deltaValue.textContent =
        formatNumber(dx, 6);


    rectangleValue.textContent =
        n;


    const methodName = getMethodName(method);


    methodLabel.textContent =
        `Método: ${methodName}`;


    methodExplanation.textContent =
        methodName;


    deltaExplanation.textContent =
        `(${formatNumber(b)} - ${formatNumber(a)}) / ${n} = ${formatNumber(dx, 6)}`;


    /*
     * Expresión general de la suma de Riemann:
     *
     * Rn = Σ f(xi*) Δx
     */
    formulaText.textContent =
        `Rₙ = Σ f(xᵢ*) Δx ≈ ${formatNumber(sum, 6)}`;


    // Pequeña animación al actualizar el resultado
    const card = document.getElementById("resultCard");

    card.classList.remove("result-enter");

    void card.offsetWidth;

    card.classList.add("result-enter");
}


// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

function calculate() {

    hideError();


    try {

        // 1. Obtener y validar formulario.
        const data = getFormData();


        // 2. Convertir la expresión de texto en f(x).
        const func = compileSafeFunction(
            data.expression
        );


        /*
         * 3. Probamos varios puntos del intervalo antes
         *    de comenzar el cálculo.
         */
        const validationPoints = 20;


        for (
            let i = 0;
            i <= validationPoints;
            i++
        ) {

            const x =
                data.a +
                (
                    (data.b - data.a) *
                    i / validationPoints
                );


            func(x);
        }


        // 4. Calcular la suma de Riemann.
        const calculation = calculateRiemann(
            func,
            data.a,
            data.b,
            data.n,
            data.method
        );


        // 5. Actualizar resultados.
        updateResults(
            data,
            calculation
        );


        // 6. Dibujar función + rectángulos.
        drawGraph(
            func,
            data.expression,
            data.a,
            data.b,
            calculation.rectangles,
            data.method
        );


    } catch (error) {

        console.error(error);

        showError(
            error.message ||
            "Ocurrió un error al realizar el cálculo."
        );
    }
}


// ============================================================
// EVENTOS
// ============================================================

calculateButton.addEventListener(
    "click",
    calculate
);


/*
 * También calculamos al presionar Enter dentro de
 * alguno de los inputs.
 */
[
    functionInput,
    lowerInput,
    upperInput,
    intervalInput
].forEach(input => {

    input.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {
                calculate();
            }
        }
    );

});


/*
 * Cambiar el método actualiza automáticamente la gráfica.
 */
methodSelect.addEventListener(
    "change",
    calculate
);


// ============================================================
// CÁLCULO INICIAL
// ============================================================

window.addEventListener(
    "DOMContentLoaded",
    calculate
);
