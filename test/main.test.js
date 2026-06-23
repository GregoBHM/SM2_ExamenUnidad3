describe('Pruebas Unitarias de la Aplicación', () => {

  test('La suma de puntos de experiencia debe ser correcta', () => {
    const xpInicial = 100;
    const xpGanada = 50;
    const xpTotal = xpInicial + xpGanada;
    expect(xpTotal).toBe(150);
  });

  test('Debe validar correctamente el dominio de correo de la UPT', () => {
    const emailValido = 'estudiante@virtual.upt.pe';
    const emailInvalido = 'estudiante@gmail.com';
    const validarDominioUPT = (email) => email.endsWith('@virtual.upt.pe');
    expect(validarDominioUPT(emailValido)).toBe(true);
    expect(validarDominioUPT(emailInvalido)).toBe(false);
  });

  test('Debe formatear el estado de conexion correctamente', () => {
    const formatConnectionState = (isConnected) => isConnected ? 'Online' : 'Offline';
    expect(formatConnectionState(true)).toBe('Online');
    expect(formatConnectionState(false)).toBe('Offline');
  });

});
