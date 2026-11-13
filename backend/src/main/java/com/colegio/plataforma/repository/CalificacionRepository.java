package com.colegio.plataforma.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Repository
public class CalificacionRepository {

    private final JdbcTemplate jdbcTemplate;

    public CalificacionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Verificar que el curso pertenece al docente
    public boolean cursoPerteneceDocente(
            Long cursoId,
            Long docenteId) {

        Integer cantidad = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM cursos
            WHERE id = ?
              AND docente_id = ?
              AND activo = 1
            """,
            Integer.class,
            cursoId,
            docenteId
        );

        return cantidad != null && cantidad > 0;
    }

    // Listar estudiantes matriculados activamente en un curso
    public List<Map<String, Object>> listarEstudiantesCurso(
            Long cursoId,
            Long docenteId) {

        return jdbcTemplate.queryForList("""
            SELECT
                u.id AS alumno_id,
                u.codigo,
                u.nombres,
                u.apellidos,
                u.correo
            FROM matriculas m
            INNER JOIN usuarios u
                ON u.id = m.alumno_id
            INNER JOIN cursos c
                ON c.id = m.curso_id
            WHERE m.curso_id = ?
              AND c.docente_id = ?
              AND m.estado = 'ACTIVA'
              AND u.activo = 1
            ORDER BY u.apellidos, u.nombres
            """,
            cursoId,
            docenteId
        );
    }

    // Listar calificaciones de un curso
    public List<Map<String, Object>> listarCalificacionesCurso(
            Long cursoId,
            Long docenteId) {

        return jdbcTemplate.queryForList("""
            SELECT
                cal.id,
                cal.alumno_id,
                u.codigo,
                u.nombres,
                u.apellidos,
                cal.curso_id,
                cal.tarea_id,
                t.titulo AS tarea,
                cal.docente_id,
                cal.nota,
                cal.observacion,
                cal.fecha_registro,
                cal.actualizado_en
            FROM calificaciones cal
            INNER JOIN usuarios u
                ON u.id = cal.alumno_id
            LEFT JOIN tareas t
                ON t.id = cal.tarea_id
            INNER JOIN cursos c
                ON c.id = cal.curso_id
            WHERE cal.curso_id = ?
              AND cal.docente_id = ?
              AND c.docente_id = ?
            ORDER BY u.apellidos, u.nombres, cal.fecha_registro DESC
            """,
            cursoId,
            docenteId,
            docenteId
        );
    }

    // Listar cursos activos asignados al docente
    public List<Map<String, Object>> listarCursosDocente(
            Long docenteId) {

        return jdbcTemplate.queryForList("""
            SELECT
                id,
                nombre,
                grado,
                seccion
            FROM cursos
            WHERE docente_id = ?
            AND activo = 1
            ORDER BY nombre, grado, seccion
            """,
            docenteId
        );
    }

    // Comprobar matrícula activa del estudiante
    public boolean estudianteMatriculado(
            Long alumnoId,
            Long cursoId) {

        Integer cantidad = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM matriculas
            WHERE alumno_id = ?
              AND curso_id = ?
              AND estado = 'ACTIVA'
            """,
            Integer.class,
            alumnoId,
            cursoId
        );

        return cantidad != null && cantidad > 0;
    }

    // Comprobar que una tarea pertenece al curso
    public boolean tareaPerteneceCurso(
            Long tareaId,
            Long cursoId) {

        Integer cantidad = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM tareas
            WHERE id = ?
              AND curso_id = ?
              AND estado <> 'BORRADOR'
            """,
            Integer.class,
            tareaId,
            cursoId
        );

        return cantidad != null && cantidad > 0;
    }

    // Registrar una calificación
    public int registrarCalificacion(
            Long alumnoId,
            Long cursoId,
            Long tareaId,
            Long docenteId,
            BigDecimal nota,
            String observacion) {

        return jdbcTemplate.update("""
            INSERT INTO calificaciones (
                alumno_id,
                curso_id,
                tarea_id,
                docente_id,
                nota,
                observacion
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            alumnoId,
            cursoId,
            tareaId,
            docenteId,
            nota,
            observacion
        );
    }

    // Actualizar una calificación existente
    public int actualizarCalificacion(
            Long id,
            Long docenteId,
            BigDecimal nota,
            String observacion) {

        return jdbcTemplate.update("""
            UPDATE calificaciones
            SET nota = ?,
                observacion = ?
            WHERE id = ?
              AND docente_id = ?
            """,
            nota,
            observacion,
            id,
            docenteId
        );
    }
}
