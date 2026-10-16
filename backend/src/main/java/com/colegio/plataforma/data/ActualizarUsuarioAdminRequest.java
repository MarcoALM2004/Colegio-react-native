package com.colegio.plataforma.data;

public record ActualizarUsuarioAdminRequest(
        String nombres,
        String apellidos,
        String correo,
        String dni,
        String telefono,
        String grado,
        String seccion,
        String especialidad,
        String password
) {}
