package com.colegio.plataforma.data;

public record CursoAdminResponse(
    Long id,
    String nombre,
    String nivel,
    String grado,
    String seccion,
    Long docenteId,
    String docente,
    String descripcion,
    String color,
    Integer anio,
    Integer cantidadEstudiantes
) {}