package com.colegio.plataforma.data;

import java.time.LocalDateTime;

public record ForoRespuestaResponse(
    Long id,
    Long publicacionId,
    Long usuarioId,
    String codigoUsuario,
    String nombreUsuario,
    String rol,
    String contenido,
    LocalDateTime creadoEn
) {}
