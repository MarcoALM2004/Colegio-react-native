package com.colegio.plataforma.data;

public record MaterialRequest(
    String titulo,
    String descripcion,
    Boolean modoLibro
) {}
