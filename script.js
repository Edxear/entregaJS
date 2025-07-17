class Movimiento {
    constructor(tipo, cantidad) {
        this.tipo = tipo;
        this.cantidad = cantidad;
        this.fecha = new Date();
    }
}

class Prestamo {
    constructor(monto, cuotas, tasaInteres, nombreSolicitante, ingresosMensuales) {
        this.monto = monto;
        this.cuotas = cuotas;
        this.tasaInteres = tasaInteres;
        this.nombreSolicitante = nombreSolicitante;
        this.ingresosMensuales = ingresosMensuales;
        this.fechaSolicitud = new Date();
        this.aprobado = false;
        this.cuotasPagadas = 0;
    }

    simular() {
        const tasaMensual = this.tasaInteres / 100 / 12;
        const interesTotal = this.monto * tasaMensual * this.cuotas;
        const totalAPagar = this.monto + interesTotal;
        const cuotaMensual = totalAPagar / this.cuotas;

        return {
            monto: this.monto,
            cuotas: this.cuotas,
            tasaInteres: this.tasaInteres,
            interesTotal: interesTotal,
            totalAPagar: totalAPagar,
            cuotaMensual: cuotaMensual
        };
    }

    aprobar() {
        const simulacion = this.simular();
        this.aprobado = this.ingresosMensuales >= (simulacion.cuotaMensual * 3);
        return this.aprobado;
    }
}

class CuentaBancaria {
    constructor(numeroCuenta, titular, saldoInicial = 0) {
        this.numeroCuenta = numeroCuenta;
        this.titular = titular;
        this.saldo = saldoInicial;
        this.movimientos = [];
        this.prestamos = [];
    }

    depositar(cantidad) {
        if (isNaN(cantidad)) {
            throw new Error("Por favor ingrese una cantidad válida");
        }
        if (cantidad <= 0) {
            throw new Error("La cantidad debe ser mayor a cero");
        }

        this.saldo += cantidad;
        this.movimientos.push(new Movimiento("Depósito", cantidad));
        this.guardarEnLocalStorage();
    }

    retirar(cantidad) {
        if (isNaN(cantidad)) {
            throw new Error("Por favor ingrese una cantidad válida");
        }
        if (cantidad <= 0) {
            throw new Error("La cantidad debe ser mayor a cero");
        }
        if (this.saldo < cantidad) {
            throw new Error("Saldo insuficiente");
        }

        this.saldo -= cantidad;
        this.movimientos.push(new Movimiento("Retiro", cantidad));
        this.guardarEnLocalStorage();
    }

    solicitarPrestamo(prestamo) {
        if (prestamo.aprobar()) {
            this.prestamos.push(prestamo);
            this.depositar(prestamo.monto);
            this.movimientos.push(new Movimiento("Préstamo aprobado", prestamo.monto));
            this.guardarEnLocalStorage();
            return true;
        }
        return false;
    }

    obtenerMovimientos() {
        return this.movimientos;
    }

    obtenerPrestamos() {
        return this.prestamos;
    }

    guardarEnLocalStorage() {
        localStorage.setItem('cuentaBancaria', JSON.stringify({
            numeroCuenta: this.numeroCuenta,
            titular: this.titular,
            saldo: this.saldo,
            movimientos: this.movimientos,
            prestamos: this.prestamos
        }));
    }

    static cargarDesdeLocalStorage() {
        const datos = localStorage.getItem('cuentaBancaria');
        if (!datos) return null;

        const { numeroCuenta, titular, saldo, movimientos, prestamos } = JSON.parse(datos);
        const cuenta = new CuentaBancaria(numeroCuenta, titular, saldo);
        cuenta.movimientos = movimientos.map(m => new Movimiento(m.tipo, m.cantidad));

        if (prestamos && prestamos.length > 0) {
            cuenta.prestamos = prestamos.map(p => {
                const prestamo = new Prestamo(p.monto, p.cuotas, p.tasaInteres, p.nombreSolicitante, p.ingresosMensuales);
                prestamo.aprobado = p.aprobado;
                prestamo.cuotasPagadas = p.cuotasPagadas;
                prestamo.fechaSolicitud = new Date(p.fechaSolicitud);
                return prestamo;
            });
        }

        return cuenta;
    }
}

class InterfazBancaria {
    constructor(cuenta) {
        this.cuenta = cuenta;
        this.initElements();
        this.initEventListeners();
        this.updateAccountInfo();
        this.mostrarMovimientos();
    }

    initElements() {
        this.titularElement = document.getElementById('titular');
        this.numeroCuentaElement = document.getElementById('numero-cuenta');
        this.saldoElement = document.getElementById('saldo');

        this.depositoContainer = document.getElementById('deposito-container');
        this.retiroContainer = document.getElementById('retiro-container');
        this.depositoCantidad = document.getElementById('deposito-cantidad');
        this.retiroCantidad = document.getElementById('retiro-cantidad');
        this.confirmarDepositoBtn = document.getElementById('confirmar-deposito-btn');
        this.confirmarRetiroBtn = document.getElementById('confirmar-retiro-btn');

        this.movimientosContainer = document.getElementById('movimientos-container');
        this.movimientosList = document.getElementById('movimientos-list');

        this.prestamoContainer = document.getElementById('prestamo-container');
        this.montoPrestamoInput = document.getElementById('monto-prestamo');
        this.cuotasPrestamoSelect = document.getElementById('cuotas-prestamo');
        this.tasaInteresInput = document.getElementById('tasa-interes');
        this.simularPrestamoBtn = document.getElementById('simular-prestamo-btn');
        this.simulacionResultados = document.getElementById('simulacion-resultados');
        this.simMonto = document.getElementById('sim-monto');
        this.simCuotas = document.getElementById('sim-cuotas');
        this.simTasa = document.getElementById('sim-tasa');
        this.simInteres = document.getElementById('sim-interes');
        this.simTotal = document.getElementById('sim-total');
        this.simCuota = document.getElementById('sim-cuota');
        this.nombreSolicitanteInput = document.getElementById('nombre-solicitante');
        this.ingresosMensualesInput = document.getElementById('ingresos-mensuales');
        this.solicitarPrestamoBtn = document.getElementById('solicitar-prestamo-btn');
        this.toggleDataBtn = document.getElementById('toggle-data-btn');
this.isDataHidden = false;
    }

    initEventListeners() {
        this.confirmarDepositoBtn.addEventListener('click', () => this.confirmarDeposito());
        this.confirmarRetiroBtn.addEventListener('click', () => this.confirmarRetiro());

        this.simularPrestamoBtn.addEventListener('click', () => this.simularPrestamo());
        this.solicitarPrestamoBtn.addEventListener('click', () => this.solicitarPrestamo());
        this.toggleDataBtn.addEventListener('click', () => this.toggleAccountData());
    }

    updateAccountInfo() {
        this.titularElement.textContent = `Titular: ${this.cuenta.titular}`;
        this.numeroCuentaElement.textContent = `N° Cuenta: ${this.cuenta.numeroCuenta}`;
        this.saldoElement.textContent = `Saldo: $${this.cuenta.saldo.toLocaleString('es-AR')}`;
    }

    toggleAccountData() {
    this.isDataHidden = !this.isDataHidden;
    
    const accountInfo = document.querySelector('.account-info');
    const eyeIcon = this.toggleDataBtn.querySelector('.eye-icon');
    
    if (this.isDataHidden) {
        accountInfo.classList.add('hidden');
        this.toggleDataBtn.innerHTML = '<span class="eye-icon">👁️</span> Mostrar Datos';
        
       
        localStorage.setItem('hideAccountData', 'true');
    } else {
        accountInfo.classList.remove('hidden');
        this.toggleDataBtn.innerHTML = '<span class="eye-icon">👁️</span> Ocultar Datos';
        
       
        localStorage.setItem('hideAccountData', 'false');
    }
}

    showToast(message, type = 'info') {
        const background = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        }[type];

        Toastify({
            text: message,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: background,
                color: type === 'warning' ? '#212529' : 'white',
                'box-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)',
                'border-radius': '5px',
                'font-family': "'Arial', sans-serif",
                'font-size': '0.95rem'
            },
            className: `toastify-${type}`
        }).showToast();
    }

    async confirmarDeposito() {
        try {
            const cantidad = parseFloat(this.depositoCantidad.value);
            if (isNaN(cantidad)) {
                this.showToast("Por favor ingrese una cantidad válida", "error");
                return;
            }

            if (cantidad <= 0) {
                this.showToast("La cantidad debe ser mayor a cero", "error");
                return;
            }

            const result = await Swal.fire({
                title: "¿Confirmar depósito?",
                html: `Estás a punto de depositar <strong>$${cantidad.toLocaleString('es-AR')}</strong>`,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Confirmar",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#020609",
                cancelButtonColor: "#6c757d",
                background: '#ffffff',
                backdrop: `
                    rgba(0,0,0,0.5)
                    url("/images/nyan-cat.gif")
                    left top
                    no-repeat
                `,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });

            if (result.isConfirmed) {
                this.cuenta.depositar(cantidad);
                this.showToast(`Depositaste $${cantidad.toLocaleString('es-AR')}`, "success");
                this.updateAccountInfo();
                this.depositoCantidad.value = '';
                this.mostrarMovimientos();
            }
        } catch (error) {
            this.showToast(error.message, "error");
        }
    }

    async confirmarRetiro() {
        try {
            const cantidad = parseFloat(this.retiroCantidad.value);
            if (isNaN(cantidad)) {
                this.showToast("Por favor ingrese una cantidad válida", "error");
                return;
            }

            if (cantidad <= 0) {
                this.showToast("La cantidad debe ser mayor a cero", "error");
                return;
            }

            const result = await Swal.fire({
                title: "¿Confirmar retiro?",
                html: `Estás a punto de retirar <strong>$${cantidad.toLocaleString('es-AR')}</strong>`,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Confirmar",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#020609",
                cancelButtonColor: "#6c757d",
                background: '#ffffff'
            });

            if (result.isConfirmed) {
                this.cuenta.retirar(cantidad);
                this.showToast(`Retiraste $${cantidad.toLocaleString('es-AR')}`, "success");
                this.updateAccountInfo();
                this.retiroCantidad.value = '';
                this.mostrarMovimientos();
            }
        } catch (error) {
            this.showToast(error.message, "error");
        }
    }

    mostrarMovimientos() {
        const movimientos = this.cuenta.obtenerMovimientos();
        this.movimientosList.innerHTML = '';

        if (movimientos.length === 0) {
            this.movimientosList.innerHTML = '<p class="no-movimientos">No hay movimientos registrados.</p>';
        } else {
            movimientos.forEach((mov, index) => {
                const movimientoElement = document.createElement('div');
                movimientoElement.className = `movimiento ${mov.tipo.toLowerCase()}`;
                movimientoElement.innerHTML = `
                    <span>${index + 1}. ${mov.tipo}</span>
                    <span>$${mov.cantidad.toLocaleString('es-AR')}</span>
                    <span>${mov.fecha.toLocaleString('es-AR')}</span>
                `;
                this.movimientosList.appendChild(movimientoElement);
            });
        }
    }

    simularPrestamo() {
        try {
            const monto = parseFloat(this.montoPrestamoInput.value);
            const cuotas = parseInt(this.cuotasPrestamoSelect.value);
            const tasaInteres = parseFloat(this.tasaInteresInput.value);

            if (isNaN(monto)) {
                this.showToast("Por favor ingrese un monto válido", "error");
                return;
            }

            if (monto <= 0) {
                this.showToast("El monto debe ser mayor a cero", "error");
                return;
            }

            if (isNaN(tasaInteres) || tasaInteres <= 0) {
                this.showToast("Tasa de interés inválida", "error");
                return;
            }

            const prestamo = new Prestamo(monto, cuotas, tasaInteres, '', 0);
            const simulacion = prestamo.simular();

            this.simMonto.textContent = simulacion.monto.toLocaleString('es-AR');
            this.simCuotas.textContent = simulacion.cuotas;
            this.simTasa.textContent = simulacion.tasaInteres.toFixed(2);
            this.simInteres.textContent = simulacion.interesTotal.toFixed(2);
            this.simTotal.textContent = simulacion.totalAPagar.toFixed(2);
            this.simCuota.textContent = simulacion.cuotaMensual.toFixed(2);

            this.simulacionResultados.style.display = 'block';
            this.simulacionResultados.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            this.showToast(error.message, "error");
        }
    }

    async solicitarPrestamo() {
        try {
            const monto = parseFloat(this.montoPrestamoInput.value);
            const cuotas = parseInt(this.cuotasPrestamoSelect.value);
            const tasaInteres = parseFloat(this.tasaInteresInput.value);
            const nombreSolicitante = this.nombreSolicitanteInput.value.trim();
            const ingresosMensuales = parseFloat(this.ingresosMensualesInput.value);

            if (isNaN(monto)) {
                this.showToast("Por favor ingrese un monto válido", "error");
                return;
            }

            if (monto <= 0) {
                this.showToast("El monto debe ser mayor a cero", "error");
                return;
            }

            if (isNaN(tasaInteres)) {
                this.showToast("Por favor ingrese una tasa de interés válida", "error");
                return;
            }

            if (tasaInteres <= 0) {
                this.showToast("La tasa de interés debe ser mayor a cero", "error");
                return;
            }

            if (!nombreSolicitante) {
                this.showToast("Debe ingresar su nombre completo", "error");
                return;
            }

            if (isNaN(ingresosMensuales)) {
                this.showToast("Por favor ingrese ingresos mensuales válidos", "error");
                return;
            }

            if (ingresosMensuales <= 0) {
                this.showToast("Los ingresos mensuales deben ser mayores a cero", "error");
                return;
            }

            const prestamo = new Prestamo(monto, cuotas, tasaInteres, nombreSolicitante, ingresosMensuales);

            const result = await Swal.fire({
                title: "¿Solicitar préstamo?",
                html: `
                    <div style="text-align: left;">
                        <p>Estás a punto de solicitar un préstamo con los siguientes detalles:</p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li><strong>Monto:</strong> $${monto.toLocaleString('es-AR')}</li>
                            <li><strong>Plazo:</strong> ${cuotas} meses</li>
                            <li><strong>Tasa anual:</strong> ${tasaInteres}%</li>
                            <li><strong>Cuota estimada:</strong> $${(prestamo.simular().cuotaMensual).toFixed(2)}</li>
                        </ul>
                    </div>
                `,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Solicitar",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#020609",
                cancelButtonColor: "#6c757d",
                background: '#ffffff',
                width: '600px'
            });

            if (result.isConfirmed) {
                if (prestamo.aprobar()) {
                    this.cuenta.solicitarPrestamo(prestamo);
                    this.updateAccountInfo();
                    
                    await Swal.fire({
                        title: "¡Préstamo aprobado!",
                        html: `
                            <div style="text-align: center;">
                                <p style="font-size: 1.2rem; margin-bottom: 20px;">El préstamo por <strong>$${monto.toLocaleString('es-AR')}</strong> ha sido aprobado.</p>
                                <p>El monto ha sido depositado en tu cuenta.</p>
                            </div>
                        `,
                        icon: "success",
                        confirmButtonColor: "#28a745",
                        background: '#ffffff'
                    });
                    
                    this.mostrarMovimientos();

                    this.montoPrestamoInput.value = '';
                    this.nombreSolicitanteInput.value = '';
                    this.ingresosMensualesInput.value = '';
                    this.tasaInteresInput.value = '15';
                    this.simulacionResultados.style.display = 'none';
                } else {
                    await Swal.fire({
                        icon: "error",
                        title: "Préstamo no aprobado",
                        html: `
                            <div style="text-align: left;">
                                <p>Lo sentimos, tu solicitud de préstamo no ha sido aprobada.</p>
                                <p style="margin-top: 10px;">Razón: <strong>Tus ingresos no cumplen con los requisitos mínimos</strong>.</p>
                                <p style="margin-top: 10px;">Para aprobar este préstamo necesitarías ingresos mensuales de al menos <strong>$${(prestamo.simular().cuotaMensual * 3).toFixed(2)}</strong>.</p>
                            </div>
                        `,
                        confirmButtonColor: "#dc3545",
                        background: '#ffffff'
                    });
                }
            }
        } catch (error) {
            this.showToast(error.message, "error");
        }
    }
}

function iniciarAplicacion() {
    particlesJS.load('particles-js', 'particlesjs-config.json', function() {
        console.log('Particles.js config loaded');
    });

    let cuenta = CuentaBancaria.cargarDesdeLocalStorage();

    if (!cuenta) {
        cuenta = new CuentaBancaria("184546784-7", "Exequiel Dearmas", 10000000);
        cuenta.guardarEnLocalStorage();
    }

    const interfaz = new InterfazBancaria(cuenta);
    

    const hideData = localStorage.getItem('hideAccountData') === 'true';
    if (hideData) {
        interfaz.toggleAccountData(); 
    }
}

document.addEventListener('DOMContentLoaded', iniciarAplicacion);