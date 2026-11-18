package com.colegio.plataforma.data;

import java.time.LocalDateTime;

public record UnidadArchivoResponse(
    Long id,
    Long unidadId,
    String nombreOriginal,
    String tipoMime,
    String extension,
    Long tamano,
    LocalDateTime creadoEn
) {}
