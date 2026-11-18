package com.colegio.plataforma.data;

import java.time.LocalDateTime;

public record TareaRequest(
    Long unidadId,
    String titulo,
    String descripcion,
    LocalDateTime fechaEntrega
) {}
