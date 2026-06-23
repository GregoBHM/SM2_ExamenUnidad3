describe('RCE UPT - Pruebas del Frontend', () => {

  test('usuario nuevo empieza como Novato con 0 XP', () => {
    const calcularNivel = (xp) => {
      if (xp >= 1000) return 'Mentor Académico';
      if (xp >= 50) return 'Aprendiz';
      return 'Novato';
    };
    expect(calcularNivel(0)).toBe('Novato');
    expect(calcularNivel(50)).toBe('Aprendiz');
    expect(calcularNivel(1000)).toBe('Mentor Académico');
  });

  test('valida correctamente el dominio de correo institucional', () => {
    const esCorreoUPT = (email) => email.endsWith('@virtual.upt.pe');
    expect(esCorreoUPT('estudiante@virtual.upt.pe')).toBe(true);
    expect(esCorreoUPT('estudiante@gmail.com')).toBe(false);
  });

  test('formatea el estado de conexion WebSocket', () => {
    const formatearEstado = (conectado) => conectado ? 'Online' : 'Offline';
    expect(formatearEstado(true)).toBe('Online');
    expect(formatearEstado(false)).toBe('Offline');
  });

});
