
const cuenta = {
  numeroCuenta: "184546784-7",
  titular: "Exequiel Dearmas",
  saldo: 10000000,
  movimientos: []
};


function menuBancario() {
  let opcion;
  do {
    opcion = prompt(
      `Bienvenido ${cuenta.titular}\n` +
      `N° Cuenta: ${cuenta.numeroCuenta}\n` +
      `Saldo actual: $${cuenta.saldo}\n\n` +
      "Seleccione una opción:\n" +
      "1. Depositar dinero\n" +
      "2. Retirar dinero\n" +
      "3. Ver movimientos\n" +
      "4. Salir"
    );

    switch (opcion) {
      case "1":
        depositar();
        break;
      case "2":
        retirar();
        break;
      case "3":
        mostrarMovimientos();
        break;
      case "4":
        alert("Gracias por usar nuestros servicios bancarios.");
        break;
      default:
        alert("Opción no válida. Por favor seleccione 1-4.");
    }
  } while (opcion !== "4");
}


function depositar() {
  const cantidad = parseFloat(prompt("Ingrese la cantidad a depositar:"));
  
  if (isNaN(cantidad) || cantidad <= 0) {
    alert("Por favor ingrese una cantidad válida.");
    return;
  }

  cuenta.saldo += cantidad;
  cuenta.movimientos.push({
    tipo: "Depósito",
    cantidad: cantidad,
    fecha: new Date()
  });
  
  alert(`Depositaste $${cantidad.toLocaleString()}\nSaldo actual: $${cuenta.saldo.toLocaleString()}`);
}


function retirar() {
  const cantidad = parseFloat(prompt("Ingrese la cantidad a retirar:"));
  
  if (isNaN(cantidad) || cantidad <= 0) {
    alert("Por favor ingrese una cantidad válida.");
    return;
  }

  if (cuenta.saldo >= cantidad) {
    cuenta.saldo -= cantidad;
    cuenta.movimientos.push({
      tipo: "Retiro",
      cantidad: cantidad,
      fecha: new Date()
    });
    alert(`Retiraste $${cantidad.toLocaleString()}\nSaldo actual: $${cuenta.saldo.toLocaleString()}`);
  } else {
    alert("Saldo insuficiente.");
  }
}


function mostrarMovimientos() {
  if (cuenta.movimientos.length === 0) {
    alert("No hay movimientos registrados.");
    return;
  }

  let mensaje = "Historial de movimientos:\n\n";
  cuenta.movimientos.forEach((mov, index) => {
    mensaje += `${index + 1}. ${mov.tipo}: $${mov.cantidad.toLocaleString()} (${mov.fecha.toLocaleString()})\n`;
  });

  alert(mensaje);
}

menuBancario();

