package com.colegio.plataforma.data;

public record CursoAdminRequest(
    String nombre,
    String nivel,
    String grado,
    String seccion,
    Long docenteId,
    String descripcion,
    String color
) {}