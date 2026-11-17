package com.colegio.plataforma.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class CursoConsultaRepository {

    private final JdbcTemplate jdbc;

    public CursoConsultaRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<String> obtenerRolPorCodigo(String codigo) {
        List<String> roles = jdbc.queryForList("""
            SELECT UPPER(r.nombre)
            FROM usuarios u
            INNER JOIN roles r ON r.id = u.rol_id
            WHERE u.codigo = ?
              AND u.activo = 1
            """,
            String.class,
            codigo
        );

        return roles.stream().findFirst();
    }

    public List<Map<String, Object>> listarCursosDocente(String codigo) {
        return jdbc.queryForList("""
            SELECT
                c.id AS id,
                c.nombre AS nombre,
                c.nivel AS nivel,
                c.grado AS grado,
                c.seccion AS seccionCodigo,
                CONCAT(
                    c.grado,
                    CASE
                        WHEN c.nivel = 'Secundaria' THEN ' Sec '
                        ELSE ' Prim '
                    END,
                    c.seccion
                ) AS seccion,
                c.docente_id AS docenteId,
                CONCAT(d.nombres, ' ', d.apellidos) AS docente,
                c.descripcion AS descripcion,
                c.color AS color,
                c.icono AS icono,
                c.anio_escolar AS anio,
                (
                    SELECT COUNT(*)
                    FROM matriculas m
                    WHERE m.curso_id = c.id
                      AND m.estado = 'ACTIVA'
                ) AS cantidadEstudiantes
            FROM cursos c
            INNER JOIN usuarios u
                ON u.id = c.docente_id
            INNER JOIN roles r
                ON r.id = u.rol_id
            LEFT JOIN usuarios d
                ON d.id = c.docente_id
            WHERE u.codigo = ?
              AND UPPER(r.nombre) = 'DOCENTE'
              AND u.activo = 1
              AND c.activo = 1
            ORDER BY c.nivel, c.grado, c.seccion, c.nombre
            """,
            codigo
        );
    }

    public List<Map<String, Object>> listarCursosEstudiante(String codigo) {
        return jdbc.queryForList("""
            SELECT DISTINCT
                c.id AS id,
                c.nombre AS nombre,
                c.nivel AS nivel,
                c.grado AS grado,
                c.seccion AS seccionCodigo,
                CONCAT(
                    c.grado,
                    CASE
                        WHEN c.nivel = 'Secundaria' THEN ' Sec '
                        ELSE ' Prim '
                    END,
                    c.seccion
                ) AS seccion,
                c.docente_id AS docenteId,
                CASE
                    WHEN d.id IS NULL THEN NULL
                    ELSE CONCAT(d.nombres, ' ', d.apellidos)
                END AS docente,
                c.descripcion AS descripcion,
                c.color AS color,
                c.icono AS icono,
                c.anio_escolar AS anio,
                (
                    SELECT COUNT(*)
                    FROM matriculas mc
                    WHERE mc.curso_id = c.id
                      AND mc.estado = 'ACTIVA'
                ) AS cantidadEstudiantes
            FROM matriculas m
            INNER JOIN usuarios u
                ON u.id = m.alumno_id
            INNER JOIN roles r
                ON r.id = u.rol_id
            INNER JOIN cursos c
                ON c.id = m.curso_id
            LEFT JOIN usuarios d
                ON d.id = c.docente_id
            WHERE u.codigo = ?
              AND UPPER(r.nombre) = 'ALUMNO'
              AND u.activo = 1
              AND c.activo = 1
              AND m.estado = 'ACTIVA'
            ORDER BY c.nivel, c.grado, c.seccion, c.nombre
            """,
            codigo
        );
    }
}
