package com.colegio.plataforma.models;

public record Usuario(
        Long id,
        String codigo,
        String nombres,
        String apellidos,
        String correo,
        String rol
) {}