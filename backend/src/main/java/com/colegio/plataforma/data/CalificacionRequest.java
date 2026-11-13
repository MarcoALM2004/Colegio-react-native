package com.colegio.plataforma.data;

import java.math.BigDecimal;

public record CalificacionRequest(
        Long alumnoId,
        Long cursoId,
        Long tareaId,
        Long docenteId,
        BigDecimal nota,
        String observacion
) {}
