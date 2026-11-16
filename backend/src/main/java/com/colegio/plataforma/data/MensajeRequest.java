package com.colegio.plataforma.data;

public record MensajeRequest(
        Long remitenteId,
        Long destinatarioId,
        String asunto,
        String contenido
) {}
