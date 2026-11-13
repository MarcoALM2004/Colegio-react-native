package com.colegio.plataforma.data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CalificacionResponse(
        Long id,
        Long alumnoId,
        String codigo,
        String nombres,
        String apellidos,
        Long cursoId,
        Long tareaId,
        String tarea,
        Long docenteId,
        BigDecimal nota,
        String observacion,
        LocalDateTime fechaRegistro,
        LocalDateTime actualizadoEn
) {}
