package com.colegio.plataforma.data;

import java.math.BigDecimal;

public record CalificarEntregaRequest(
    BigDecimal nota,
    String observacionDocente
) {}
