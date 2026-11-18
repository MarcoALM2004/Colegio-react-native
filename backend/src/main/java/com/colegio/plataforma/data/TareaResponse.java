package com.colegio.plataforma.data;

import java.time.LocalDateTime;

public record TareaResponse(
    Long id,
    Long cursoId,
    Long unidadId,
    String unidadTitulo,
    String titulo,
    String descripcion,
    LocalDateTime fechaEntrega,
    String creadoPor,
    LocalDateTime creadoEn,
    Boolean entregada
) {}
