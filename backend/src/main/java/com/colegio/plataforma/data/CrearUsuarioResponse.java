package com.colegio.plataforma.data;

public record CrearUsuarioResponse(
        String mensaje,
        String codigo,
        String rol,
        String nombres,
        String apellidos,
        String correo,
        String dni,
        String contrasenaTemporal
) {
}
