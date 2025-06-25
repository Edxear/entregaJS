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
    if (isNaN(cantidad) || cantidad <= 0) {
      throw new Error("Cantidad inválida para depósito");
    }

    this.saldo += cantidad;
    this.movimientos.push(new Movimiento("Depósito", cantidad));
    this.guardarEnLocalStorage();
  }

  retirar(cantidad) {
    if (isNaN(cantidad) || cantidad <= 0) {
      throw new Error("Cantidad inválida para retiro");
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
    this.currentOperation = null;
    this.initElements();
    this.initEventListeners();
    this.updateAccountInfo();
  }

  initElements() {
    this.titularElement = document.getElementById('titular');
    this.numeroCuentaElement = document.getElementById('numero-cuenta');
    this.saldoElement = document.getElementById('saldo');
    this.depositarBtn = document.getElementById('depositar-btn');
    this.retirarBtn = document.getElementById('retirar-btn');
    this.movimientosBtn = document.getElementById('movimientos-btn');
    this.prestamosBtn = document.getElementById('prestamos-btn');
    this.operationForm = document.getElementById('operation-form');
    this.formTitle = document.getElementById('form-title');
    this.cantidadInput = document.getElementById('cantidad-input');
    this.confirmarBtn = document.getElementById('confirmar-btn');
    this.cancelarBtn = document.getElementById('cancelar-btn');
    this.movimientosContainer = document.getElementById('movimientos-container');
    this.movimientosList = document.getElementById('movimientos-list');
    this.cerrarMovimientosBtn = document.getElementById('cerrar-movimientos-btn');
    this.prestamoContainer = document.getElementById('prestamo-container');
    this.cerrarPrestamoBtn = document.getElementById('cerrar-prestamo-btn');
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
    this.messagesContainer = document.getElementById('messages');
  }

  initEventListeners() {
    this.depositarBtn.addEventListener('click', () => this.showOperationForm('depositar'));
    this.retirarBtn.addEventListener('click', () => this.showOperationForm('retirar'));
    this.movimientosBtn.addEventListener('click', () => this.showMovimientos());
    this.prestamosBtn.addEventListener('click', () => this.showPrestamoForm());
    this.confirmarBtn.addEventListener('click', () => this.confirmOperation());
    this.cancelarBtn.addEventListener('click', () => this.hideOperationForm());
    this.cerrarMovimientosBtn.addEventListener('click', () => this.hideMovimientos());
    this.cerrarPrestamoBtn.addEventListener('click', () => this.hidePrestamoForm());
    this.simularPrestamoBtn.addEventListener('click', () => this.simularPrestamo());
    this.solicitarPrestamoBtn.addEventListener('click', () => this.solicitarPrestamo());
  }

  updateAccountInfo() {
    this.titularElement.textContent = `Titular: ${this.cuenta.titular}`;
    this.numeroCuentaElement.textContent = `N° Cuenta: ${this.cuenta.numeroCuenta}`;
    this.saldoElement.textContent = `Saldo: $${this.cuenta.saldo.toLocaleString()}`;
  }

  showOperationForm(operation) {
    this.currentOperation = operation;
    this.operationForm.style.display = 'block';
    this.formTitle.textContent = operation === 'depositar' ? 'Depositar Dinero' : 'Retirar Dinero';
    this.cantidadInput.value = '';
    this.cantidadInput.focus();
  }

  hideOperationForm() {
    this.operationForm.style.display = 'none';
    this.currentOperation = null;
  }

  confirmOperation() {
    try {
      const cantidad = parseFloat(this.cantidadInput.value);
      
      if (this.currentOperation === 'depositar') {
        this.cuenta.depositar(cantidad);
        this.showMessage(`Depositaste $${cantidad.toLocaleString()}`, 'success');
      } else {
        this.cuenta.retirar(cantidad);
        this.showMessage(`Retiraste $${cantidad.toLocaleString()}`, 'success');
      }
      
      this.updateAccountInfo();
      this.hideOperationForm();
    } catch (error) {
      this.showMessage(`Error: ${error.message}`, 'error');
    }
  }

  showMovimientos() {
    const movimientos = this.cuenta.obtenerMovimientos();
    this.movimientosList.innerHTML = '';
    
    if (movimientos.length === 0) {
      this.movimientosList.innerHTML = '<p>No hay movimientos registrados.</p>';
    } else {
      movimientos.forEach((mov, index) => {
        const movimientoElement = document.createElement('div');
        movimientoElement.className = `movimiento ${mov.tipo.toLowerCase()}`;
        movimientoElement.innerHTML = `
          <span>${index + 1}. ${mov.tipo}</span>
          <span>$${mov.cantidad.toLocaleString()}</span>
          <span>${mov.fecha.toLocaleString()}</span>
        `;
        this.movimientosList.appendChild(movimientoElement);
      });
    }
    
    this.movimientosContainer.style.display = 'block';
  }

  hideMovimientos() {
    this.movimientosContainer.style.display = 'none';
  }

  showPrestamoForm() {
    this.prestamoContainer.style.display = 'block';
    this.simulacionResultados.style.display = 'none';
    this.montoPrestamoInput.value = '';
    this.nombreSolicitanteInput.value = '';
    this.ingresosMensualesInput.value = '';
    this.tasaInteresInput.value = '15';
  }

  hidePrestamoForm() {
    this.prestamoContainer.style.display = 'none';
  }

  simularPrestamo() {
    try {
      const monto = parseFloat(this.montoPrestamoInput.value);
      const cuotas = parseInt(this.cuotasPrestamoSelect.value);
      const tasaInteres = parseFloat(this.tasaInteresInput.value);
      
      if (isNaN(monto) || monto <= 0) {
        throw new Error("Monto del préstamo inválido");
      }
      
      if (isNaN(tasaInteres) || tasaInteres <= 0) {
        throw new Error("Tasa de interés inválida");
      }
      
      const prestamo = new Prestamo(monto, cuotas, tasaInteres, '', 0);
      const simulacion = prestamo.simular();
      
      this.simMonto.textContent = simulacion.monto.toLocaleString();
      this.simCuotas.textContent = simulacion.cuotas;
      this.simTasa.textContent = simulacion.tasaInteres.toFixed(2);
      this.simInteres.textContent = simulacion.interesTotal.toFixed(2);
      this.simTotal.textContent = simulacion.totalAPagar.toFixed(2);
      this.simCuota.textContent = simulacion.cuotaMensual.toFixed(2);
      
      this.simulacionResultados.style.display = 'block';
    } catch (error) {
      this.showMessage(`Error: ${error.message}`, 'error');
    }
  }

  solicitarPrestamo() {
    try {
      const monto = parseFloat(this.montoPrestamoInput.value);
      const cuotas = parseInt(this.cuotasPrestamoSelect.value);
      const tasaInteres = parseFloat(this.tasaInteresInput.value);
      const nombreSolicitante = this.nombreSolicitanteInput.value.trim();
      const ingresosMensuales = parseFloat(this.ingresosMensualesInput.value);
      
      if (isNaN(monto) || monto <= 0) {
        throw new Error("Monto del préstamo inválido");
      }
      
      if (isNaN(tasaInteres) || tasaInteres <= 0) {
        throw new Error("Tasa de interés inválida");
      }
      
      if (!nombreSolicitante) {
        throw new Error("Debe ingresar su nombre completo");
      }
      
      if (isNaN(ingresosMensuales) || ingresosMensuales <= 0) {
        throw new Error("Ingresos mensuales inválidos");
      }
      
      const prestamo = new Prestamo(monto, cuotas, tasaInteres, nombreSolicitante, ingresosMensuales);
      
      if (prestamo.aprobar()) {
        this.cuenta.solicitarPrestamo(prestamo);
        this.updateAccountInfo();
        this.hidePrestamoForm();
        this.showMessage(`¡Préstamo aprobado por $${monto.toLocaleString()}! El monto ha sido depositado en tu cuenta.`, 'success');
      } else {
        this.showMessage("Lo sentimos, tu solicitud de préstamo no ha sido aprobada. Tus ingresos no cumplen con los requisitos.", 'error');
      }
    } catch (error) {
      this.showMessage(`Error: ${error.message}`, 'error');
    }
  }

  showMessage(text, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = text;
    this.messagesContainer.appendChild(messageElement);
    
    setTimeout(() => {
      messageElement.remove();
    }, 3000);
  }
}

function iniciarAplicacion() {
  let cuenta = CuentaBancaria.cargarDesdeLocalStorage();
  
  if (!cuenta) {
    cuenta = new CuentaBancaria("184546784-7", "Exequiel Dearmas", 10000000);
    cuenta.guardarEnLocalStorage();
  }

  new InterfazBancaria(cuenta);
}

document.addEventListener('DOMContentLoaded', iniciarAplicacion);

