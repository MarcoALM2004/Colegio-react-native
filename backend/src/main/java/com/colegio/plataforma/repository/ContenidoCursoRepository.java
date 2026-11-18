package com.colegio.plataforma.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public class ContenidoCursoRepository {

    private final JdbcTemplate jdbc;

    public ContenidoCursoRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // =====================================================
    // UTILIDADES
    // =====================================================

    private Long insertar(String sql, Object... parametros) {
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                sql,
                Statement.RETURN_GENERATED_KEYS
            );

            for (int i = 0; i < parametros.length; i++) {
                ps.setObject(i + 1, parametros[i]);
            }

            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();

        if (key == null) {
            throw new IllegalStateException(
                "No se pudo recuperar el ID del registro creado."
            );
        }

        return key.longValue();
    }

    private Map<String, Object> buscarUno(
        String sql,
        Object... parametros
    ) {
        List<Map<String, Object>> resultados =
            jdbc.queryForList(sql, parametros);

        return resultados.isEmpty() ? null : resultados.get(0);
    }

    // =====================================================
    // USUARIOS Y PERMISOS
    // =====================================================

    public Long obtenerUsuarioId(String codigo) {
        List<Long> resultados = jdbc.query("""
            SELECT id
            FROM usuarios
            WHERE codigo = ?
              AND activo = 1
            LIMIT 1
            """,
            (rs, rowNum) -> rs.getLong("id"),
            codigo
        );

        if (resultados.isEmpty()) {
            throw new IllegalArgumentException(
                "El usuario no existe o está inactivo."
            );
        }

        return resultados.get(0);
    }

    public String obtenerRol(String codigo) {
        List<String> resultados = jdbc.query("""
            SELECT UPPER(r.nombre)
            FROM usuarios u
            INNER JOIN roles r ON r.id = u.rol_id
            WHERE u.codigo = ?
              AND u.activo = 1
            LIMIT 1
            """,
            (rs, rowNum) -> rs.getString(1),
            codigo
        );

        if (resultados.isEmpty()) {
            throw new IllegalArgumentException(
                "No se encontró el rol del usuario."
            );
        }

        return resultados.get(0);
    }

    public boolean cursoExiste(Long cursoId) {
        Integer cantidad = jdbc.queryForObject("""
            SELECT COUNT(*)
            FROM cursos
            WHERE id = ?
              AND activo = 1
            """,
            Integer.class,
            cursoId
        );

        return cantidad != null && cantidad > 0;
    }

    public boolean esDocenteDelCurso(
        Long cursoId,
        Long usuarioId
    ) {
        Integer cantidad = jdbc.queryForObject("""
            SELECT COUNT(*)
            FROM cursos c
            INNER JOIN usuarios u ON u.id = c.docente_id
            INNER JOIN roles r ON r.id = u.rol_id
            WHERE c.id = ?
              AND c.docente_id = ?
              AND c.activo = 1
              AND u.activo = 1
              AND UPPER(r.nombre) = 'DOCENTE'
            """,
            Integer.class,
            cursoId,
            usuarioId
        );

        return cantidad != null && cantidad > 0;
    }

    public boolean alumnoMatriculado(
        Long cursoId,
        Long alumnoId
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
            alumnoId
        );

        return cantidad != null && cantidad > 0;
    }

    // =====================================================
    // UNIDADES
    // =====================================================

    public List<Map<String, Object>> listarUnidades(Long cursoId) {
        return jdbc.queryForList("""
            SELECT
                u.id,
                u.curso_id AS cursoId,
                u.titulo,
                u.descripcion,
                u.orden AS ordenUnidad,
                NULL AS creadoPor,
                NULL AS creadoEn,
                NULL AS nombreCreador
            FROM unidades u
            WHERE u.curso_id = ?
            ORDER BY u.orden ASC, u.id ASC
            """,
            cursoId
        );
    }

    public Long crearUnidad(
        Long cursoId,
        String titulo,
        String descripcion,
        Integer orden,
        Long usuarioId
    ) {
        return insertar("""
            INSERT INTO unidades (
                curso_id,
                titulo,
                descripcion,
                orden
            )
            VALUES (?, ?, ?, ?)
            """,
            cursoId,
            titulo,
            descripcion,
            orden == null ? 1 : orden
        );
    }

    public int actualizarUnidad(
        Long unidadId,
        Long cursoId,
        String titulo,
        String descripcion,
        Integer orden
    ) {
        return jdbc.update("""
            UPDATE unidades
            SET titulo = ?,
                descripcion = ?,
                orden = ?
            WHERE id = ?
              AND curso_id = ?
            """,
            titulo,
            descripcion,
            orden == null ? 1 : orden,
            unidadId,
            cursoId
        );
    }

    public int eliminarUnidad(Long unidadId, Long cursoId) {
        return jdbc.update("""
            DELETE FROM unidades
            WHERE id = ?
              AND curso_id = ?
            """,
            unidadId,
            cursoId
        );
    }

    public boolean unidadPerteneceCurso(
        Long unidadId,
        Long cursoId
    ) {
        Integer cantidad = jdbc.queryForObject("""
            SELECT COUNT(*)
            FROM unidades
            WHERE id = ?
              AND curso_id = ?
            """,
            Integer.class,
            unidadId,
            cursoId
        );

        return cantidad != null && cantidad > 0;
    }

    public Map<String, Object> buscarUnidad(Long unidadId) {
        return buscarUno("""
            SELECT *
            FROM unidades
            WHERE id = ?
            """,
            unidadId
        );
    }

    // =====================================================
    // ARCHIVOS DE UNIDADES
    // =====================================================

    public Long guardarArchivoUnidad(
        Long unidadId,
        String nombreOriginal,
        String nombreGuardado,
        String ruta,
        String tipoMime,
        String extension,
        Long tamano,
        Long usuarioId
    ) {
        return insertar("""
            INSERT INTO unidad_archivos (
                unidad_id,
                nombre_original,
                nombre_guardado,
                ruta_archivo,
                tipo_mime,
                extension,
                tamano,
                creado_por
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            unidadId,
            nombreOriginal,
            nombreGuardado,
            ruta,
            tipoMime,
            extension,
            tamano,
            usuarioId
        );
    }

    public List<Map<String, Object>> listarArchivosUnidad(
        Long unidadId
    ) {
        return jdbc.queryForList("""
            SELECT
                id,
                unidad_id AS unidadId,
                nombre_original AS nombreOriginal,
                tipo_mime AS tipoMime,
                extension,
                tamano,
                creado_en AS creadoEn
            FROM unidad_archivos
            WHERE unidad_id = ?
            ORDER BY creado_en DESC
            """,
            unidadId
        );
    }

    public Map<String, Object> buscarArchivoUnidad(Long archivoId) {
        return buscarUno("""
            SELECT *
            FROM unidad_archivos
            WHERE id = ?
            """,
            archivoId
        );
    }

    public Map<String, Object> buscarUnidadPorArchivo(
        Long archivoId
    ) {
        return buscarUno("""
            SELECT u.*
            FROM unidades u
            INNER JOIN unidad_archivos a ON a.unidad_id = u.id
            WHERE a.id = ?
            """,
            archivoId
        );
    }

    public int eliminarArchivoUnidad(Long archivoId) {
        return jdbc.update("""
            DELETE FROM unidad_archivos
            WHERE id = ?
            """,
            archivoId
        );
    }

    // =====================================================
    // MATERIALES
    // =====================================================

    public List<Map<String, Object>> listarMateriales(Long cursoId) {
        return jdbc.queryForList("""
            SELECT
                m.id,
                m.curso_id AS cursoId,
                m.docente_id AS docenteId,
                m.titulo,
                m.descripcion,
                m.titulo AS nombreOriginal,
                m.tipo,
                m.tipo AS tipoMime,
                NULL AS extension,
                NULL AS tamano,
                FALSE AS modoLibro,
                m.recurso_url AS recursoUrl,
                m.recurso_url AS ruta_archivo,
                m.publicado,
                m.docente_id AS creadoPor,
                m.creado_en AS creadoEn,
                CONCAT(u.nombres, ' ', u.apellidos) AS nombreCreador
            FROM materiales m
            INNER JOIN usuarios u ON u.id = m.docente_id
            WHERE m.curso_id = ?
              AND m.publicado = 1
            ORDER BY m.creado_en DESC
            """,
            cursoId
        );
    }

    public Long crearMaterial(
        Long cursoId,
        String titulo,
        String descripcion,
        String nombreOriginal,
        String nombreGuardado,
        String ruta,
        String tipoMime,
        String extension,
        Long tamano,
        boolean modoLibro,
        Long usuarioId
    ) {
        String tipo;

        if ("pdf".equalsIgnoreCase(extension)) {
            tipo = "PDF";
        } else if (tipoMime != null && tipoMime.startsWith("video/")) {
            tipo = "VIDEO";
        } else if (tipoMime != null && tipoMime.startsWith("text/")) {
            tipo = "DOCUMENTO";
        } else {
            tipo = "DOCUMENTO";
        }

        return insertar("""
            INSERT INTO materiales (
                curso_id,
                docente_id,
                titulo,
                descripcion,
                tipo,
                recurso_url,
                publicado
            )
            VALUES (?, ?, ?, ?, ?, ?, 1)
            """,
            cursoId,
            usuarioId,
            titulo,
            descripcion,
            tipo,
            ruta
        );
    }

    public Map<String, Object> buscarMaterial(Long materialId) {
        return buscarUno("""
            SELECT
                m.*,
                m.recurso_url AS ruta_archivo,
                m.titulo AS nombre_original,
                m.tipo AS tipo_mime
            FROM materiales m
            WHERE m.id = ?
            """,
            materialId
        );
    }

    public int eliminarMaterial(Long materialId, Long cursoId) {
        return jdbc.update("""
            DELETE FROM materiales
            WHERE id = ?
              AND curso_id = ?
            """,
            materialId,
            cursoId
        );
    }

    // =====================================================
    // TAREAS
    // =====================================================

    public List<Map<String, Object>> listarTareas(
        Long cursoId,
        Long alumnoId
    ) {
        return jdbc.queryForList("""
            SELECT
                t.id,
                t.curso_id AS cursoId,
                t.unidad_id AS unidadId,
                u.titulo AS unidadTitulo,
                t.titulo,
                t.descripcion,
                t.fecha_entrega AS fechaEntrega,
                t.creado_por AS creadoPor,
                t.creado_en AS creadoEn,
                CASE
                    WHEN ? IS NULL THEN FALSE
                    WHEN EXISTS (
                        SELECT 1
                        FROM tarea_entregas e
                        WHERE e.tarea_id = t.id
                          AND e.alumno_id = ?
                    ) THEN TRUE
                    ELSE FALSE
                END AS entregada
            FROM tareas_curso t
            LEFT JOIN unidades u ON u.id = t.unidad_id
            WHERE t.curso_id = ?
              AND t.activo = 1
            ORDER BY t.fecha_entrega ASC, t.creado_en DESC
            """,
            alumnoId,
            alumnoId,
            cursoId
        );
    }

    public Long crearTarea(
        Long cursoId,
        Long unidadId,
        String titulo,
        String descripcion,
        LocalDateTime fechaEntrega,
        Long usuarioId
    ) {
        return insertar("""
            INSERT INTO tareas_curso (
                curso_id,
                unidad_id,
                titulo,
                descripcion,
                fecha_entrega,
                creado_por
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            cursoId,
            unidadId,
            titulo,
            descripcion,
            fechaEntrega,
            usuarioId
        );
    }

    public Map<String, Object> buscarTarea(Long tareaId) {
        return buscarUno("""
            SELECT *
            FROM tareas_curso
            WHERE id = ?
              AND activo = 1
            """,
            tareaId
        );
    }

    public int actualizarTarea(
        Long tareaId,
        Long cursoId,
        Long unidadId,
        String titulo,
        String descripcion,
        LocalDateTime fechaEntrega
    ) {
        return jdbc.update("""
            UPDATE tareas_curso
            SET unidad_id = ?,
                titulo = ?,
                descripcion = ?,
                fecha_entrega = ?
            WHERE id = ?
              AND curso_id = ?
              AND activo = 1
            """,
            unidadId,
            titulo,
            descripcion,
            fechaEntrega,
            tareaId,
            cursoId
        );
    }

    public int eliminarTarea(Long tareaId, Long cursoId) {
        return jdbc.update("""
            UPDATE tareas_curso
            SET activo = 0
            WHERE id = ?
              AND curso_id = ?
              AND activo = 1
            """,
            tareaId,
            cursoId
        );
    }

    // =====================================================
    // ARCHIVOS ADJUNTOS DE TAREAS
    // =====================================================

    public Long guardarArchivoTarea(
        Long tareaId,
        String nombreOriginal,
        String nombreGuardado,
        String ruta,
        String tipoMime,
        Long tamano
    ) {
        return insertar("""
            INSERT INTO tarea_archivos (
                tarea_id,
                nombre_original,
                nombre_guardado,
                ruta_archivo,
                tipo_mime,
                tamano
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            tareaId,
            nombreOriginal,
            nombreGuardado,
            ruta,
            tipoMime,
            tamano
        );
    }

    public List<Map<String, Object>> listarArchivosTarea(
        Long tareaId
    ) {
        return jdbc.queryForList("""
            SELECT
                id,
                tarea_id AS tareaId,
                nombre_original AS nombreOriginal,
                tipo_mime AS tipoMime,
                tamano
            FROM tarea_archivos
            WHERE tarea_id = ?
            ORDER BY creado_en DESC
            """,
            tareaId
        );
    }

    public Map<String, Object> buscarArchivoTarea(Long archivoId) {
        return buscarUno("""
            SELECT *
            FROM tarea_archivos
            WHERE id = ?
            """,
            archivoId
        );
    }

    public Map<String, Object> buscarTareaPorArchivo(
        Long archivoId
    ) {
        return buscarUno("""
            SELECT t.*
            FROM tareas_curso t
            INNER JOIN tarea_archivos a ON a.tarea_id = t.id
            WHERE a.id = ?
            """,
            archivoId
        );
    }

    public int eliminarArchivoTarea(Long archivoId) {
        return jdbc.update("""
            DELETE FROM tarea_archivos
            WHERE id = ?
            """,
            archivoId
        );
    }

    // =====================================================
    // ENTREGAS
    // =====================================================

    public Long guardarEntrega(
        Long tareaId,
        Long alumnoId,
        String nombreOriginal,
        String nombreGuardado,
        String ruta,
        String tipoMime,
        Long tamano,
        String comentario
    ) {
        jdbc.update("""
            INSERT INTO tarea_entregas (
                tarea_id,
                alumno_id,
                nombre_original,
                nombre_guardado,
                ruta_archivo,
                tipo_mime,
                tamano,
                comentario,
                entregado_en
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE
                nombre_original = VALUES(nombre_original),
                nombre_guardado = VALUES(nombre_guardado),
                ruta_archivo = VALUES(ruta_archivo),
                tipo_mime = VALUES(tipo_mime),
                tamano = VALUES(tamano),
                comentario = VALUES(comentario),
                nota = NULL,
                observacion_docente = NULL,
                calificado_en = NULL,
                entregado_en = CURRENT_TIMESTAMP
            """,
            tareaId,
            alumnoId,
            nombreOriginal,
            nombreGuardado,
            ruta,
            tipoMime,
            tamano,
            comentario
        );

        List<Long> ids = jdbc.query("""
            SELECT id
            FROM tarea_entregas
            WHERE tarea_id = ?
              AND alumno_id = ?
            """,
            (rs, rowNum) -> rs.getLong("id"),
            tareaId,
            alumnoId
        );

        if (ids.isEmpty()) {
            throw new IllegalStateException(
                "No se pudo recuperar la entrega registrada."
            );
        }

        return ids.get(0);
    }

    public List<Map<String, Object>> listarEntregas(Long tareaId) {
        return jdbc.queryForList("""
            SELECT
                e.id,
                e.tarea_id AS tareaId,
                e.alumno_id AS alumnoId,
                u.codigo AS codigoAlumno,
                CONCAT(u.nombres, ' ', u.apellidos)
                    AS nombreAlumno,
                e.nombre_original AS nombreOriginal,
                e.tipo_mime AS tipoMime,
                e.tamano,
                e.comentario,
                e.nota,
                e.observacion_docente AS observacionDocente,
                e.entregado_en AS entregadoEn,
                e.calificado_en AS calificadoEn
            FROM tarea_entregas e
            INNER JOIN usuarios u ON u.id = e.alumno_id
            WHERE e.tarea_id = ?
            ORDER BY e.entregado_en DESC
            """,
            tareaId
        );
    }

    public Map<String, Object> buscarEntregaAlumno(
        Long tareaId,
        Long alumnoId
    ) {
        return buscarUno("""
            SELECT *
            FROM tarea_entregas
            WHERE tarea_id = ?
              AND alumno_id = ?
            """,
            tareaId,
            alumnoId
        );
    }

    public Map<String, Object> buscarEntrega(Long entregaId) {
        return buscarUno("""
            SELECT *
            FROM tarea_entregas
            WHERE id = ?
            """,
            entregaId
        );
    }

    public int calificarEntrega(
        Long entregaId,
        BigDecimal nota,
        String observacion
    ) {
        return jdbc.update("""
            UPDATE tarea_entregas
            SET nota = ?,
                observacion_docente = ?,
                calificado_en = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            nota,
            observacion,
            entregaId
        );
    }

    // =====================================================
    // FORO: PUBLICACIONES
    // =====================================================

    public List<Map<String, Object>> listarPublicaciones(
        Long cursoId
    ) {
        return jdbc.queryForList("""
            SELECT
                p.id,
                p.curso_id AS cursoId,
                p.usuario_id AS usuarioId,
                u.codigo AS codigoUsuario,
                CONCAT(u.nombres, ' ', u.apellidos)
                    AS nombreUsuario,
                r.nombre AS rol,
                p.contenido,
                p.creado_en AS creadoEn,
                p.actualizado_en AS actualizadoEn
            FROM foro_publicaciones p
            INNER JOIN usuarios u ON u.id = p.usuario_id
            INNER JOIN roles r ON r.id = u.rol_id
            WHERE p.curso_id = ?
            ORDER BY p.creado_en DESC
            """,
            cursoId
        );
    }

    public Long crearPublicacion(
        Long cursoId,
        Long usuarioId,
        String contenido
    ) {
        return insertar("""
            INSERT INTO foro_publicaciones (
                curso_id,
                usuario_id,
                contenido
            )
            VALUES (?, ?, ?)
            """,
            cursoId,
            usuarioId,
            contenido
        );
    }

    public Map<String, Object> buscarPublicacion(
        Long publicacionId
    ) {
        return buscarUno("""
            SELECT *
            FROM foro_publicaciones
            WHERE id = ?
            """,
            publicacionId
        );
    }

    public int eliminarPublicacion(Long publicacionId) {
        return jdbc.update("""
            DELETE FROM foro_publicaciones
            WHERE id = ?
            """,
            publicacionId
        );
    }

    // =====================================================
    // FORO: RESPUESTAS
    // =====================================================

    public List<Map<String, Object>> listarRespuestas(
        Long publicacionId
    ) {
        return jdbc.queryForList("""
            SELECT
                fr.id,
                fr.foro_id AS publicacionId,
                fr.autor_id AS usuarioId,
                u.codigo AS codigoUsuario,
                CONCAT(u.nombres, ' ', u.apellidos)
                    AS nombreUsuario,
                r.nombre AS rol,
                fr.contenido,
                fr.creado_en AS creadoEn
            FROM foro_respuestas fr
            INNER JOIN usuarios u ON u.id = fr.autor_id
            INNER JOIN roles r ON r.id = u.rol_id
            WHERE fr.foro_id = ?
            ORDER BY fr.creado_en ASC
            """,
            publicacionId
        );
    }

    public Long crearRespuesta(
        Long publicacionId,
        Long usuarioId,
        String contenido
    ) {
        return insertar("""
            INSERT INTO foro_respuestas (
                foro_id,
                autor_id,
                contenido
            )
            VALUES (?, ?, ?)
            """,
            publicacionId,
            usuarioId,
            contenido
        );
    }

    public Map<String, Object> buscarRespuesta(Long respuestaId) {
        return buscarUno("""
            SELECT
                id,
                foro_id AS publicacion_id,
                autor_id AS usuario_id,
                contenido,
                creado_en
            FROM foro_respuestas
            WHERE id = ?
            """,
            respuestaId
        );
    }

    public int eliminarRespuesta(Long respuestaId) {
        return jdbc.update("""
            DELETE FROM foro_respuestas
            WHERE id = ?
            """,
            respuestaId
        );
    }
}
