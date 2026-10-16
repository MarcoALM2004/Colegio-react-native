
package com.colegio.plataforma.data;

public record AdminPerfilResponse(
        Long id,
        String codigo,
        String nombres,
        String apellidos,
        String correo,
        String telefono,
        String rol,
        boolean activo,
        String fechaRegistro
) {
}
