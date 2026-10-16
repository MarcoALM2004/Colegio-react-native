package com.colegio.plataforma.data;

public record PerfilResponse(
        Long id,
        String codigo,
        String nombres,
        String apellidos,
        String correo,
        String telefono,
        String rol
) {
}