package com.colegio.plataforma.repository;

import com.colegio.plataforma.data.MensajeContactoResponse;
import com.colegio.plataforma.data.MensajeResponse;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;

@Repository
public class MensajeRepository {

    private final JdbcTemplate jdbcTemplate;

    public MensajeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean usuarioActivo(Long usuarioId) {

        Integer cantidad = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM usuarios
            WHERE id = ?
              AND activo = 1
            """,
            Integer.class,
            usuarioId
        );

        return cantidad != null && cantidad > 0;
    }

    /*
     * Reglas de comunicación:
     *
     * DOCENTE <-> ALUMNO:
     * Deben compartir un curso activo y una matrícula activa.
     *
     * ADMIN <-> DOCENTE:
     * No necesitan compartir cursos.
     */
    public boolean existeRelacionPermitida(
            Long usuarioId,
            Long contactoId) {

        Integer cantidad = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM usuarios actual
            INNER JOIN roles rolActual
                ON rolActual.id = actual.rol_id
            INNER JOIN usuarios contacto
                ON contacto.id = ?
            INNER JOIN roles rolContacto
                ON rolContacto.id = contacto.rol_id
            WHERE actual.id = ?
              AND actual.activo = 1
              AND contacto.activo = 1
              AND (
                    (
                        rolActual.nombre = 'ADMIN'
                        AND rolContacto.nombre = 'DOCENTE'
                    )
                    OR
                    (
                        rolActual.nombre = 'DOCENTE'
                        AND rolContacto.nombre = 'ADMIN'
                    )
                    OR
                    (
                        rolActual.nombre = 'DOCENTE'
                        AND rolContacto.nombre = 'ALUMNO'
                        AND EXISTS (
                            SELECT 1
                            FROM cursos c
                            INNER JOIN matriculas m
                                ON m.curso_id = c.id
                            WHERE c.docente_id = actual.id
                              AND m.alumno_id = contacto.id
                              AND c.activo = 1
                              AND m.estado = 'ACTIVA'
                        )
                    )
                    OR
                    (
                        rolActual.nombre = 'ALUMNO'
                        AND rolContacto.nombre = 'DOCENTE'
                        AND EXISTS (
                            SELECT 1
                            FROM matriculas m
                            INNER JOIN cursos c
                                ON c.id = m.curso_id
                            WHERE m.alumno_id = actual.id
                              AND c.docente_id = contacto.id
                              AND c.activo = 1
                              AND m.estado = 'ACTIVA'
                        )
                    )
              )
            """,
            Integer.class,
            contactoId,
            usuarioId
        );

        return cantidad != null && cantidad > 0;
    }

    public List<MensajeContactoResponse> listarContactos(
            Long usuarioId) {

        return jdbcTemplate.query("""
            SELECT
                contacto.id,
                contacto.codigo,
                contacto.nombres,
                contacto.apellidos,
                rolContacto.nombre AS rol,

                (
                    SELECT
                        CASE
                            WHEN m.archivo_url IS NOT NULL
                                THEN '📷 Fotografía'
                            ELSE m.contenido
                        END
                    FROM mensajes m
                    WHERE (
                        m.remitente_id = actual.id
                        AND m.destinatario_id = contacto.id
                    )
                    OR (
                        m.remitente_id = contacto.id
                        AND m.destinatario_id = actual.id
                    )
                    ORDER BY m.enviado_en DESC, m.id DESC
                    LIMIT 1
                ) AS ultimoMensaje,

                (
                    SELECT MAX(m.enviado_en)
                    FROM mensajes m
                    WHERE (
                        m.remitente_id = actual.id
                        AND m.destinatario_id = contacto.id
                    )
                    OR (
                        m.remitente_id = contacto.id
                        AND m.destinatario_id = actual.id
                    )
                ) AS fechaUltimoMensaje,

                (
                    SELECT COUNT(*)
                    FROM mensajes m
                    WHERE m.remitente_id = contacto.id
                      AND m.destinatario_id = actual.id
                      AND m.leido = 0
                ) AS noLeidos

            FROM usuarios actual

            INNER JOIN roles rolActual
                ON rolActual.id = actual.rol_id

            INNER JOIN usuarios contacto
                ON contacto.id <> actual.id

            INNER JOIN roles rolContacto
                ON rolContacto.id = contacto.rol_id

            WHERE actual.id = ?
              AND actual.activo = 1
              AND contacto.activo = 1
              AND (
                    (
                        rolActual.nombre = 'ADMIN'
                        AND rolContacto.nombre = 'DOCENTE'
                    )
                    OR
                    (
                        rolActual.nombre = 'DOCENTE'
                        AND rolContacto.nombre = 'ADMIN'
                    )
                    OR
                    (
                        rolActual.nombre = 'DOCENTE'
                        AND rolContacto.nombre = 'ALUMNO'
                        AND EXISTS (
                            SELECT 1
                            FROM cursos c
                            INNER JOIN matriculas m
                                ON m.curso_id = c.id
                            WHERE c.docente_id = actual.id
                              AND m.alumno_id = contacto.id
                              AND c.activo = 1
                              AND m.estado = 'ACTIVA'
                        )
                    )
                    OR
                    (
                        rolActual.nombre = 'ALUMNO'
                        AND rolContacto.nombre = 'DOCENTE'
                        AND EXISTS (
                            SELECT 1
                            FROM matriculas m
                            INNER JOIN cursos c
                                ON c.id = m.curso_id
                            WHERE m.alumno_id = actual.id
                              AND c.docente_id = contacto.id
                              AND c.activo = 1
                              AND m.estado = 'ACTIVA'
                        )
                    )
              )

            ORDER BY fechaUltimoMensaje DESC,
                     contacto.apellidos,
                     contacto.nombres
            """,
            (rs, rowNum) -> {
                Timestamp fecha =
                        rs.getTimestamp("fechaUltimoMensaje");

                return new MensajeContactoResponse(
                        rs.getLong("id"),
                        rs.getString("codigo"),
                        rs.getString("nombres"),
                        rs.getString("apellidos"),
                        rs.getString("rol"),
                        rs.getString("ultimoMensaje"),
                        fecha != null
                                ? fecha.toLocalDateTime()
                                : null,
                        rs.getInt("noLeidos")
                );
            },
            usuarioId
        );
    }

    public List<MensajeResponse> listarConversacion(
            Long usuarioId,
            Long contactoId) {

        return jdbcTemplate.query("""
            SELECT
                id,
                remitente_id,
                destinatario_id,
                asunto,
                contenido,
                leido,
                enviado_en,
                archivo_url
            FROM mensajes
            WHERE (
                remitente_id = ?
                AND destinatario_id = ?
            )
            OR (
                remitente_id = ?
                AND destinatario_id = ?
            )
            ORDER BY enviado_en ASC, id ASC
            """,
            (rs, rowNum) -> mapearMensaje(rs),
            usuarioId,
            contactoId,
            contactoId,
            usuarioId
        );
    }

    public Long guardarMensaje(
            Long remitenteId,
            Long destinatarioId,
            String asunto,
            String contenido) {

        return insertarMensaje(
                remitenteId,
                destinatarioId,
                asunto,
                contenido,
                null
        );
    }

    public Long guardarImagen(
            Long remitenteId,
            Long destinatarioId,
            String archivoUrl) {

        return insertarMensaje(
                remitenteId,
                destinatarioId,
                null,
                null,
                archivoUrl
        );
    }

    private Long insertarMensaje(
            Long remitenteId,
            Long destinatarioId,
            String asunto,
            String contenido,
            String archivoUrl) {

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps =
                    connection.prepareStatement(
                            """
                            INSERT INTO mensajes (
                                remitente_id,
                                destinatario_id,
                                asunto,
                                contenido,
                                archivo_url,
                                leido
                            )
                            VALUES (?, ?, ?, ?, ?, FALSE)
                            """,
                            Statement.RETURN_GENERATED_KEYS
                    );

            ps.setLong(1, remitenteId);
            ps.setLong(2, destinatarioId);
            ps.setString(3, asunto);
            ps.setString(4, contenido);
            ps.setString(5, archivoUrl);

            return ps;
        }, keyHolder);

        Number id = keyHolder.getKey();

        if (id == null) {
            throw new IllegalStateException(
                    "No se pudo recuperar el ID del mensaje."
            );
        }

        return id.longValue();
    }

    public MensajeResponse buscarPorId(Long id) {

        return jdbcTemplate.queryForObject("""
            SELECT
                id,
                remitente_id,
                destinatario_id,
                asunto,
                contenido,
                leido,
                enviado_en,
                archivo_url
            FROM mensajes
            WHERE id = ?
            """,
            (rs, rowNum) -> mapearMensaje(rs),
            id
        );
    }

    private MensajeResponse mapearMensaje(
            java.sql.ResultSet rs
    ) throws java.sql.SQLException {

        Timestamp fecha = rs.getTimestamp("enviado_en");

        return new MensajeResponse(
                rs.getLong("id"),
                rs.getLong("remitente_id"),
                rs.getLong("destinatario_id"),
                rs.getString("asunto"),
                rs.getString("contenido"),
                rs.getBoolean("leido"),
                fecha != null
                        ? fecha.toLocalDateTime()
                        : null,
                rs.getString("archivo_url")
        );
    }

    public int marcarConversacionLeida(
            Long usuarioId,
            Long contactoId) {

        return jdbcTemplate.update("""
            UPDATE mensajes
            SET leido = TRUE
            WHERE remitente_id = ?
              AND destinatario_id = ?
              AND leido = FALSE
            """,
            contactoId,
            usuarioId
        );
    }

    public int marcarMensajeLeido(
            Long mensajeId,
            Long usuarioId) {

        return jdbcTemplate.update("""
            UPDATE mensajes
            SET leido = TRUE
            WHERE id = ?
              AND destinatario_id = ?
              AND leido = FALSE
            """,
            mensajeId,
            usuarioId
        );
    }
}
