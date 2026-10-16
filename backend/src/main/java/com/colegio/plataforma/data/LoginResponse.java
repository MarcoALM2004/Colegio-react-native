package com.colegio.plataforma.data;

import com.colegio.plataforma.models.Usuario;

public record LoginResponse(
        String mensaje,
        Usuario usuario
) {}