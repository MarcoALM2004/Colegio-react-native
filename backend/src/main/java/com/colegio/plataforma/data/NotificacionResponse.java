package com.colegio.plataforma.data;

import java.time.LocalDateTime;

public record NotificacionResponse(
    Long id,
    String tipo,
    String titulo,
    String contenido,
    Long referenciaId,
    String pantalla,
    boolean leida,
    LocalDateTime creadoEn
) {
}
