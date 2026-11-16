package com.colegio.plataforma.data;

import java.time.LocalDateTime;

public record MensajeResponse(
    Long id,
    Long remitenteId,
    Long destinatarioId,
    String asunto,
    String contenido,
    Boolean leido,
    LocalDateTime enviadoEn,
    String archivoUrl
) {}
