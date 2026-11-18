package com.colegio.plataforma.data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EntregaResponse(
    Long id,
    Long tareaId,
    Long alumnoId,
    String codigoAlumno,
    String nombreAlumno,
    String nombreOriginal,
    String tipoMime,
    Long tamano,
    String comentario,
    BigDecimal nota,
    String observacionDocente,
    LocalDateTime entregadoEn,
    LocalDateTime calificadoEn
) {}
