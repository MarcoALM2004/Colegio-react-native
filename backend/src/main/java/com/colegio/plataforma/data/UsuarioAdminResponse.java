package com.colegio.plataforma.data;

public record UsuarioAdminResponse(
        Long id,
        String codigo,
        String nombres,
        String apellidos,
        String correo,
        String dni,
        String telefono,
        String rol,
        boolean activo,
        String grado,
        String seccion,
        String especialidad
) {}
