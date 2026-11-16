package com.colegio.plataforma.data;

import java.time.LocalDateTime;

public record MensajeContactoResponse(
        Long id,
        String codigo,
        String nombres,
        String apellidos,
        String rol,
        String ultimoMensaje,
        LocalDateTime fechaUltimoMensaje,
        Integer noLeidos
) {}
