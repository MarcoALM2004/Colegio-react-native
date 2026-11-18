package com.colegio.plataforma.data;

import java.time.LocalDateTime;

public record UnidadResponse(
    Long id,
    Long cursoId,
    String titulo,
    String descripcion,
    Integer ordenUnidad,
    String creadoPor,
    LocalDateTime creadoEn
) {}
