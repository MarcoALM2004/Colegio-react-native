package com.colegio.plataforma.repository;

import com.colegio.plataforma.data.NotificacionResponse;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class NotificacionRepository {

    private final JdbcTemplate jdbc;

    public NotificacionRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void guardar(
        Long usuarioId,
        String tipo,
        String titulo,
        String contenido,
        Long referenciaId,
        String pantalla,
        String claveUnica
    ) {
        jdbc.update("""
            INSERT IGNORE INTO notificaciones
            (usuario_id, tipo, titulo, contenido,
             referencia_id, pantalla, clave_unica)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            usuarioId,
            tipo,
            titulo,
            contenido,
            referenciaId,
            pantalla,
            claveUnica
        );
    }

    public List<NotificacionResponse> listar(
        Long usuarioId,
        int limite
    ) {
        return jdbc.query("""
            SELECT id, tipo, titulo, contenido,
                   referencia_id, pantalla, leida, creado_en
            FROM notificaciones
            WHERE usuario_id = ?
            ORDER BY creado_en DESC, id DESC
            LIMIT ?
            """,
            (rs, row) -> {
                Timestamp fecha = rs.getTimestamp("creado_en");

                return new NotificacionResponse(
                    rs.getLong("id"),
                    rs.getString("tipo"),
                    rs.getString("titulo"),
                    rs.getString("contenido"),
                    rs.getObject("referencia_id") == null
                        ? null : rs.getLong("referencia_id"),
                    rs.getString("pantalla"),
                    rs.getBoolean("leida"),
                    fecha != null ? fecha.toLocalDateTime() : null
                );
            },
            usuarioId,
            limite
        );
    }

    public int contarNoLeidas(Long usuarioId) {
        Integer total = jdbc.queryForObject("""
            SELECT COUNT(*)
            FROM notificaciones
            WHERE usuario_id = ? AND leida = 0
            """,
            Integer.class,
            usuarioId
        );

        return total == null ? 0 : total;
    }

    public int marcarLeida(Long notificacionId, Long usuarioId) {
        return jdbc.update("""
            UPDATE notificaciones
            SET leida = 1
            WHERE id = ? AND usuario_id = ?
            """,
            notificacionId,
            usuarioId
        );
    }

    public int marcarTodasLeidas(Long usuarioId) {
        return jdbc.update("""
            UPDATE notificaciones
            SET leida = 1
            WHERE usuario_id = ? AND leida = 0
            """,
            usuarioId
        );
    }

    public boolean usuarioActivo(Long usuarioId) {
        Integer total = jdbc.queryForObject("""
            SELECT COUNT(*)
            FROM usuarios
            WHERE id = ? AND activo = 1
            """,
            Integer.class,
            usuarioId
        );

        return total != null && total > 0;
    }

    public String obtenerRol(Long usuarioId) {
        return jdbc.query("""
            SELECT UPPER(r.nombre)
            FROM usuarios u
            INNER JOIN roles r ON r.id = u.rol_id
            WHERE u.id = ? AND u.activo = 1
            """,
            rs -> rs.next() ? rs.getString(1) : null,
            usuarioId
        );
    }

    public void registrarDispositivo(
        Long usuarioId,
        String token,
        String plataforma
    ) {
        jdbc.update("""
            INSERT INTO dispositivos_notificaciones
                (usuario_id, expo_token, plataforma, activo)
            VALUES (?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE
                usuario_id = VALUES(usuario_id),
                plataforma = VALUES(plataforma),
                activo = 1,
                actualizado_en = CURRENT_TIMESTAMP
            """,
            usuarioId,
            token,
            plataforma
        );
    }

    public List<String> obtenerTokens(Long usuarioId) {
        return jdbc.queryForList("""
            SELECT expo_token
            FROM dispositivos_notificaciones
            WHERE usuario_id = ? AND activo = 1
            """,
            String.class,
            usuarioId
        );
    }

    public List<Long> obtenerEstudiantesDelCurso(Long cursoId) {
        return jdbc.queryForList("""
            SELECT DISTINCT m.alumno_id
            FROM matriculas m
            INNER JOIN usuarios u ON u.id = m.alumno_id
            WHERE m.curso_id = ?
              AND m.estado = 'ACTIVA'
              AND u.activo = 1
            """,
            Long.class,
            cursoId
        );
    }

    public List<Long> obtenerTodosLosEstudiantes() {
        return jdbc.queryForList("""
            SELECT u.id
            FROM usuarios u
            INNER JOIN roles r ON r.id = u.rol_id
            WHERE UPPER(r.nombre) = 'ALUMNO'
              AND u.activo = 1
            """,
            Long.class
        );
    }

    public List<Long> obtenerTodosLosDocentes() {
        return jdbc.queryForList("""
            SELECT u.id
            FROM usuarios u
            INNER JOIN roles r ON r.id = u.rol_id
            WHERE UPPER(r.nombre) = 'DOCENTE'
              AND u.activo = 1
            """,
            Long.class
        );
    }

    public List<Long> obtenerDestinatariosTarea(Long tareaId) {
        return jdbc.queryForList("""
            SELECT DISTINCT destinatarios.usuario_id
            FROM (
                SELECT t.docente_id AS usuario_id
                FROM tareas t
                WHERE t.id = ?

                UNION

                SELECT m.alumno_id AS usuario_id
                FROM tareas t
                INNER JOIN matriculas m
                    ON m.curso_id = t.curso_id
                INNER JOIN usuarios u
                    ON u.id = m.alumno_id AND u.activo = 1
                WHERE t.id = ?
                  AND m.estado = 'ACTIVA'
            ) destinatarios
            """,
            Long.class,
            tareaId,
            tareaId
        );
    }

    public List<Long> obtenerDestinatariosAviso(Long cursoId) {
        if (cursoId == null) {
            return jdbc.queryForList("""
                SELECT u.id
                FROM usuarios u
                INNER JOIN roles r ON r.id = u.rol_id
                WHERE u.activo = 1
                  AND UPPER(r.nombre) IN ('ALUMNO', 'DOCENTE')
                """,
                Long.class
            );
        }

        List<Long> destinatarios =
            obtenerEstudiantesDelCurso(cursoId);

        Long docenteId = jdbc.query("""
            SELECT docente_id
            FROM cursos
            WHERE id = ? AND activo = 1
            """,
            rs -> rs.next() ? rs.getObject(1, Long.class) : null,
            cursoId
        );

        if (docenteId != null && !destinatarios.contains(docenteId)) {
            destinatarios.add(docenteId);
        }

        return destinatarios;
    }

    public List<Object[]> obtenerTareasPublicadasRecientes() {
        return jdbc.query("""
            SELECT id, titulo, fecha_publicacion
            FROM tareas
            WHERE estado = 'PUBLICADA'
              AND fecha_publicacion >= NOW() - INTERVAL 5 MINUTE
            """,
            (rs, row) -> new Object[] {
                rs.getLong("id"),
                rs.getString("titulo")
            }
        );
    }

    public List<Object[]> obtenerAvisosPublicadosRecientes() {
        return jdbc.query("""
            SELECT id, titulo, contenido, curso_id
            FROM avisos
            WHERE publicado = 1
              AND creado_en >= NOW() - INTERVAL 5 MINUTE
            """,
            (rs, row) -> new Object[] {
                rs.getLong("id"),
                rs.getString("titulo"),
                rs.getString("contenido"),
                rs.getObject("curso_id") == null
                    ? null : rs.getLong("curso_id")
            }
        );
    }

    public List<Object[]> obtenerTareasPorVencer() {
        return jdbc.query("""
            SELECT id, titulo
            FROM tareas
            WHERE estado = 'PUBLICADA'
            AND fecha_limite IS NOT NULL
            AND fecha_limite BETWEEN
                NOW() + INTERVAL '23:55' HOUR_MINUTE
                AND NOW() + INTERVAL '24:05' HOUR_MINUTE
            """,
            (rs, row) -> new Object[] {
                rs.getLong("id"),
                rs.getString("titulo")
            }
        );
    }
}