package com.colegio.plataforma.data;

import java.time.LocalDateTime;

public record MaterialResponse(
    Long id,
    Long cursoId,
    String titulo,
    String descripcion,
    String nombreOriginal,
    String tipoMime,
    String extension,
    Long tamano,
    Boolean modoLibro,
    Boolean publicado,
    String creadoPor,
    LocalDateTime creadoEn
) {}
