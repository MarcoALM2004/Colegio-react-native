package com.colegio.plataforma.repository;

import com.colegio.plataforma.data.CursoAdminRequest;
import com.colegio.plataforma.data.CursoAdminResponse;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class CursoAdminRepository {

    private final JdbcTemplate jdbc;

    public CursoAdminRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // =====================================================
    // CURSOS
    // =====================================================

    public List<CursoAdminResponse> listar() {

        return jdbc.query("""
            SELECT
                c.id,
                c.nombre,
                c.nivel,
                c.grado,
                c.seccion,
                c.docente_id,
                c.descripcion,
                c.color,
                c.anio_escolar,
                CONCAT(u.nombres, ' ', u.apellidos) AS docente,
                (
                    SELECT COUNT(*)
                    FROM matriculas m
                    WHERE m.curso_id = c.id
                      AND m.estado = 'ACTIVA'
                ) AS cantidad_estudiantes
            FROM cursos c
            LEFT JOIN usuarios u
                ON u.id = c.docente_id
            WHERE c.activo = 1
            ORDER BY
                c.nivel,
                c.grado,
                c.seccion
            """,
            (rs, row) -> new CursoAdminResponse(
                rs.getLong("id"),
                rs.getString("nombre"),
                rs.getString("nivel"),
                rs.getString("grado"),
                rs.getString("seccion"),
                rs.getObject("docente_id") == null
                    ? null
                    : rs.getLong("docente_id"),
                rs.getString("docente"),
                rs.getString("descripcion"),
                rs.getString("color"),
                rs.getInt("anio_escolar"),
                rs.getInt("cantidad_estudiantes")
            )
        );
    }

    public Optional<CursoAdminResponse> buscarPorId(Long id) {
        return listar().stream()
            .filter(curso -> curso.id().equals(id))
            .findFirst();
    }

    public boolean existeCurso(
        String nivel,
        String grado,
        String seccion,
        Long idExcluir
    ) {

        String sql = """
            SELECT COUNT(*)
            FROM cursos
            WHERE nivel = ?
              AND REPLACE(TRIM(grado), '°', '') =
                  REPLACE(TRIM(?), '°', '')
              AND UPPER(TRIM(seccion)) = UPPER(TRIM(?))
              AND anio_escolar = YEAR(CURDATE())
              AND activo = 1
            """;

        Integer cantidad;

        if (idExcluir == null) {
            cantidad = jdbc.queryForObject(
                sql,
                Integer.class,
                nivel,
                grado,
                seccion
            );
        } else {
            cantidad = jdbc.queryForObject(
                sql + " AND id <> ?",
                Integer.class,
                nivel,
                grado,
                seccion,
                idExcluir
            );
        }

        return cantidad != null && cantidad > 0;
    }

    public Long crear(CursoAdminRequest datos) {

        jdbc.update("""
            INSERT INTO cursos (
                nombre,
                nivel,
                descripcion,
                grado,
                seccion,
                anio_escolar,
                docente_id,
                activo,
                color
            )
            VALUES (
                ?, ?, ?, ?, ?, YEAR(CURDATE()), ?, 1, ?
            )
            """,
            datos.nombre().trim(),
            datos.nivel(),
            datos.descripcion(),
            datos.grado(),
            datos.seccion(),
            datos.docenteId(),
            datos.color()
        );

        return jdbc.queryForObject(
            "SELECT LAST_INSERT_ID()",
            Long.class
        );
    }

    public int actualizar(
        Long id,
        CursoAdminRequest datos
    ) {

        return jdbc.update("""
            UPDATE cursos
            SET nombre = ?,
                nivel = ?,
                descripcion = ?,
                grado = ?,
                seccion = ?,
                docente_id = ?,
                color = ?
            WHERE id = ?
              AND activo = 1
            """,
            datos.nombre().trim(),
            datos.nivel(),
            datos.descripcion(),
            datos.grado(),
            datos.seccion(),
            datos.docenteId(),
            datos.color(),
            id
        );
    }

    public int eliminar(Long id) {

        return jdbc.update("""
            UPDATE cursos
            SET activo = 0
            WHERE id = ?
              AND activo = 1
            """,
            id
        );
    }

    // =====================================================
    // DOCENTES
    // =====================================================

    public boolean docenteValido(Long docenteId) {

        if (docenteId == null) {
            return true;
        }

        Integer cantidad = jdbc.queryForObject("""
            SELECT COUNT(*)
            FROM usuarios u
            INNER JOIN roles r
                ON r.id = u.rol_id
            WHERE u.id = ?
              AND u.activo = 1
              AND UPPER(r.nombre) = 'DOCENTE'
            """,
            Integer.class,
            docenteId
        );

        return cantidad != null && cantidad > 0;
    }

    public List<Map<String, Object>> listarDocentes(
        String busqueda
    ) {

        String filtro = busqueda == null
            ? ""
            : busqueda.trim();

        return jdbc.queryForList("""
            SELECT
                u.id,
                u.codigo,
                u.nombres,
                u.apellidos,
                u.correo
            FROM usuarios u
            INNER JOIN roles r
                ON r.id = u.rol_id
            WHERE u.activo = 1
              AND UPPER(r.nombre) = 'DOCENTE'
              AND (
                    ? = ''
                    OR LOWER(u.codigo) LIKE LOWER(?)
                    OR LOWER(u.nombres) LIKE LOWER(?)
                    OR LOWER(u.apellidos) LIKE LOWER(?)
                    OR LOWER(CONCAT(u.nombres, ' ', u.apellidos))
                        LIKE LOWER(?)
              )
            ORDER BY u.apellidos, u.nombres
            """,
            filtro,
            "%" + filtro + "%",
            "%" + filtro + "%",
            "%" + filtro + "%",
            "%" + filtro + "%"
        );
    }

    // =====================================================
    // ESTUDIANTES DISPONIBLES
    // =====================================================

    public List<Map<String, Object>> listarEstudiantesDisponibles(
        Long cursoId,
        String grado,
        String seccion,
        String busqueda
    ) {

        String filtro = busqueda == null
            ? ""
            : busqueda.trim();

        return jdbc.queryForList("""
            SELECT
                u.id,
                u.codigo,
                u.nombres,
                u.apellidos,
                u.grado,
                u.seccion
            FROM usuarios u
            INNER JOIN roles r
                ON r.id = u.rol_id
            WHERE u.activo = 1
              AND UPPER(r.nombre) = 'ALUMNO'

              AND REPLACE(TRIM(u.grado), '°', '') =
                  REPLACE(TRIM(?), '°', '')

              AND UPPER(TRIM(u.seccion)) =
                  UPPER(TRIM(?))

              AND (
                    ? = ''
                    OR LOWER(u.codigo) LIKE LOWER(?)
                    OR LOWER(u.nombres) LIKE LOWER(?)
                    OR LOWER(u.apellidos) LIKE LOWER(?)
                    OR LOWER(CONCAT(u.nombres, ' ', u.apellidos))
                        LIKE LOWER(?)
              )

              AND NOT EXISTS (
                    SELECT 1
                    FROM matriculas m
                    WHERE m.alumno_id = u.id
                      AND m.curso_id = ?
                      AND m.estado = 'ACTIVA'
              )

            ORDER BY u.apellidos, u.nombres
            """,
            grado,
            seccion,
            filtro,
            "%" + filtro + "%",
            "%" + filtro + "%",
            "%" + filtro + "%",
            "%" + filtro + "%",
            cursoId
        );
    }

    // =====================================================
    // ESTUDIANTES MATRICULADOS
    // =====================================================

    public List<Map<String, Object>> listarEstudiantesCurso(
        Long cursoId
    ) {

        return jdbc.queryForList("""
            SELECT
                u.id,
                u.codigo,
                u.nombres,
                u.apellidos,
                u.grado,
                u.seccion,
                m.id AS matricula_id,
                m.estado,
                m.fecha_matricula
            FROM matriculas m
            INNER JOIN usuarios u
                ON u.id = m.alumno_id
            WHERE m.curso_id = ?
              AND m.estado = 'ACTIVA'
            ORDER BY u.apellidos, u.nombres
            """,
            cursoId
        );
    }

    // =====================================================
    // VALIDAR ESTUDIANTE
    // =====================================================

    public boolean estudianteValido(
        Long estudianteId,
        String grado,
        String seccion
    ) {

        Integer cantidad = jdbc.queryForObject("""
            SELECT COUNT(*)
            FROM usuarios u
            INNER JOIN roles r
                ON r.id = u.rol_id
            WHERE u.id = ?
              AND u.activo = 1
              AND UPPER(r.nombre) = 'ALUMNO'
              AND REPLACE(TRIM(u.grado), '°', '') =
                  REPLACE(TRIM(?), '°', '')
              AND UPPER(TRIM(u.seccion)) =
                  UPPER(TRIM(?))
            """,
            Integer.class,
            estudianteId,
            grado,
            seccion
        );

        return cantidad != null && cantidad > 0;
    }

    public boolean yaMatriculado(
        Long cursoId,
        Long estudianteId
    ) {

        Integer cantidad = jdbc.queryForObject("""
            SELECT COUNT(*)
            FROM matriculas
            WHERE curso_id = ?
              AND alumno_id = ?
              AND estado = 'ACTIVA'
            """,
            Integer.class,
            cursoId,
            estudianteId
        );

        return cantidad != null && cantidad > 0;
    }

    public void matricular(
        Long cursoId,
        Long estudianteId
    ) {

        jdbc.update("""
            INSERT INTO matriculas (
                alumno_id,
                curso_id,
                fecha_matricula,
                estado
            )
            VALUES (
                ?, ?, CURDATE(), 'ACTIVA'
            )
            """,
            estudianteId,
            cursoId
        );
    }

    public int retirarEstudiante(
        Long cursoId,
        Long estudianteId
    ) {

        return jdbc.update("""
            UPDATE matriculas
            SET estado = 'RETIRADA'
            WHERE curso_id = ?
              AND alumno_id = ?
              AND estado = 'ACTIVA'
            """,
            cursoId,
            estudianteId
        );
    }

    // =====================================================
    // DATOS ACADÉMICOS DEL CURSO
    // =====================================================

    public Optional<Map<String, Object>> buscarCursoAcademico(
        Long cursoId
    ) {

        List<Map<String, Object>> resultados =
            jdbc.queryForList("""
                SELECT
                    id,
                    nivel,
                    grado,
                    seccion,
                    activo
                FROM cursos
                WHERE id = ?
                """,
                cursoId
            );

        return resultados.stream().findFirst();
    }
}