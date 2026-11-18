package com.colegio.plataforma.data;

import java.time.LocalDateTime;
import java.util.List;

public record ForoPublicacionResponse(
    Long id,
    Long cursoId,
    Long usuarioId,
    String codigoUsuario,
    String nombreUsuario,
    String rol,
    String contenido,
    LocalDateTime creadoEn,
    List<ForoRespuestaResponse> respuestas
) {}
