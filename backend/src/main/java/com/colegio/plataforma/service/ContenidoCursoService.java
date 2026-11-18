package com.colegio.plataforma.service;

import com.colegio.plataforma.config.ArchivoCursoConfig;
import com.colegio.plataforma.repository.ContenidoCursoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ContenidoCursoService {

    private final ContenidoCursoRepository repository;
    private final ArchivoCursoConfig archivos;

    public ContenidoCursoService(
        ContenidoCursoRepository repository,
        ArchivoCursoConfig archivos
    ) {
        this.repository = repository;
        this.archivos = archivos;
    }

    // -----------------------------------------------------
    // IDENTIDAD Y PERMISOS
    // -----------------------------------------------------

    private Long usuarioId(String codigo) {
        validarTexto(codigo, "Usuario");
        return repository.obtenerUsuarioId(codigo);
    }

    private String rol(String codigo) {
        return repository.obtenerRol(codigo).toUpperCase();
    }

    private void validarCurso(Long cursoId) {
        if (cursoId == null || cursoId <= 0 ||
                !repository.cursoExiste(cursoId)) {
            throw new IllegalArgumentException(
                "El curso no existe o está inactivo."
            );
        }
    }

    private boolean esAdmin(String codigo) {
        return "ADMIN".equals(rol(codigo));
    }

    private boolean esDocente(Long cursoId, Long usuarioId) {
        return repository.esDocenteDelCurso(cursoId, usuarioId);
    }

    private boolean esAlumno(Long cursoId, Long usuarioId) {
        return repository.alumnoMatriculado(cursoId, usuarioId);
    }

    private void exigirGestionContenido(
        Long cursoId,
        String codigo
    ) {
        validarCurso(cursoId);

        Long id = usuarioId(codigo);

        if (!esAdmin(codigo) && !esDocente(cursoId, id)) {
            throw new SecurityException(
                "No tienes permisos para administrar este curso."
            );
        }
    }

    private void exigirDocente(
        Long cursoId,
        String codigo
    ) {
        validarCurso(cursoId);

        Long id = usuarioId(codigo);

        if (!esDocente(cursoId, id)) {
            throw new SecurityException(
                "Solo el docente asignado puede realizar esta operación."
            );
        }
    }

    private void exigirAccesoCurso(
        Long cursoId,
        String codigo
    ) {
        validarCurso(cursoId);

        Long id = usuarioId(codigo);

        if (!esAdmin(codigo)
                && !esDocente(cursoId, id)
                && !esAlumno(cursoId, id)) {
            throw new SecurityException(
                "No tienes acceso a este curso."
            );
        }
    }

    private void validarTexto(String valor, String campo) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException(
                campo + " es obligatorio."
            );
        }
    }

    private void validarLongitud(
        String valor,
        String campo,
        int maximo
    ) {
        validarTexto(valor, campo);

        if (valor.trim().length() > maximo) {
            throw new IllegalArgumentException(
                campo + " supera el máximo de " + maximo + " caracteres."
            );
        }
    }

    // -----------------------------------------------------
    // UNIDADES
    // -----------------------------------------------------

    public List<Map<String, Object>> listarUnidades(
        Long cursoId,
        String codigo
    ) {
        exigirAccesoCurso(cursoId, codigo);

        return repository.listarUnidades(cursoId);
    }

    @Transactional
    public Long crearUnidad(
        Long cursoId,
        String codigo,
        String titulo,
        String descripcion,
        Integer orden
    ) {
        exigirGestionContenido(cursoId, codigo);

        validarLongitud(titulo, "Título", 180);

        if (orden != null && orden < 1) {
            throw new IllegalArgumentException(
                "El orden debe ser mayor que cero."
            );
        }

        Long id = usuarioId(codigo);

        return repository.crearUnidad(
            cursoId,
            titulo.trim(),
            descripcion,
            orden,
            id
        );
    }

    @Transactional
    public void actualizarUnidad(
        Long cursoId,
        Long unidadId,
        String codigo,
        String titulo,
        String descripcion,
        Integer orden
    ) {
        exigirGestionContenido(cursoId, codigo);

        if (!repository.unidadPerteneceCurso(unidadId, cursoId)) {
            throw new IllegalArgumentException(
                "La unidad no pertenece a este curso."
            );
        }

        validarLongitud(titulo, "Título", 180);

        if (orden != null && orden < 1) {
            throw new IllegalArgumentException(
                "El orden debe ser mayor que cero."
            );
        }

        repository.actualizarUnidad(
            unidadId,
            cursoId,
            titulo.trim(),
            descripcion,
            orden
        );
    }

    @Transactional
    public void eliminarUnidad(
        Long cursoId,
        Long unidadId,
        String codigo
    ) {
        exigirGestionContenido(cursoId, codigo);

        if (!repository.unidadPerteneceCurso(unidadId, cursoId)) {
            throw new IllegalArgumentException(
                "La unidad no pertenece a este curso."
            );
        }

        List<Map<String, Object>> lista =
            repository.listarArchivosUnidad(unidadId);

        for (Map<String, Object> archivo : lista) {
            Object id = archivo.get("id");

            Map<String, Object> detalle =
                repository.buscarArchivoUnidad(
                    ((Number) id).longValue()
                );

            if (detalle != null) {
                archivos.eliminar(
                    String.valueOf(detalle.get("ruta_archivo"))
                );
            }
        }

        repository.eliminarUnidad(unidadId, cursoId);
    }

    // -----------------------------------------------------
    // ARCHIVOS DE UNIDADES
    // -----------------------------------------------------

    @Transactional
    public Long subirArchivoUnidad(
        Long cursoId,
        Long unidadId,
        String codigo,
        MultipartFile archivo
    ) {
        exigirGestionContenido(cursoId, codigo);

        if (!repository.unidadPerteneceCurso(unidadId, cursoId)) {
            throw new IllegalArgumentException(
                "La unidad no pertenece a este curso."
            );
        }

        var guardado = archivos.guardar(archivo, "unidades");

        try {
            return repository.guardarArchivoUnidad(
                unidadId,
                guardado.nombreOriginal(),
                guardado.nombreGuardado(),
                guardado.ruta(),
                guardado.tipoMime(),
                guardado.extension(),
                guardado.tamano(),
                usuarioId(codigo)
            );
        } catch (RuntimeException e) {
            archivos.eliminar(guardado.ruta());
            throw e;
        }
    }

    public List<Map<String, Object>> listarArchivosUnidad(
        Long cursoId,
        Long unidadId,
        String codigo
    ) {
        exigirAccesoCurso(cursoId, codigo);

        if (!repository.unidadPerteneceCurso(unidadId, cursoId)) {
            throw new IllegalArgumentException(
                "La unidad no pertenece a este curso."
            );
        }

        return repository.listarArchivosUnidad(unidadId);
    }

    public Map<String, Object> obtenerArchivoUnidad(
        Long cursoId,
        Long archivoId,
        String codigo
    ) {
        exigirAccesoCurso(cursoId, codigo);

        Map<String, Object> archivo =
            repository.buscarArchivoUnidad(archivoId);

        if (archivo == null) {
            throw new IllegalArgumentException(
                "El archivo no existe."
            );
        }

        Map<String, Object> unidad =
            repository.buscarUnidadPorArchivo(archivoId);

        if (unidad == null ||
                !cursoId.equals(
                    ((Number) unidad.get("curso_id")).longValue()
                )) {
            throw new SecurityException(
                "El archivo no pertenece a este curso."
            );
        }

        return archivo;
    }

    @Transactional
    public void eliminarArchivoUnidad(
        Long cursoId,
        Long archivoId,
        String codigo
    ) {
        exigirGestionContenido(cursoId, codigo);

        Map<String, Object> archivo =
            repository.buscarArchivoUnidad(archivoId);

        if (archivo == null) {
            throw new IllegalArgumentException(
                "El archivo no existe."
            );
        }

        Map<String, Object> unidad =
            repository.buscarUnidadPorArchivo(archivoId);

        if (unidad == null ||
                !cursoId.equals(
                    ((Number) unidad.get("curso_id")).longValue()
                )) {
            throw new SecurityException(
                "El archivo no pertenece a este curso."
            );
        }

        archivos.eliminar(
            String.valueOf(archivo.get("ruta_archivo"))
        );

        repository.eliminarArchivoUnidad(archivoId);
    }

    // -----------------------------------------------------
    // MATERIALES
    // -----------------------------------------------------

    public List<Map<String, Object>> listarMateriales(
        Long cursoId,
        String codigo
    ) {
        exigirAccesoCurso(cursoId, codigo);

        return repository.listarMateriales(cursoId);
    }

    @Transactional
    public Long crearMaterial(
        Long cursoId,
        String codigo,
        String titulo,
        String descripcion,
        Boolean modoLibro,
        MultipartFile archivo
    ) {
        exigirGestionContenido(cursoId, codigo);

        validarLongitud(titulo, "Título", 180);

        var guardado = archivos.guardar(archivo, "materiales");

        if (Boolean.TRUE.equals(modoLibro)
                && !"pdf".equals(guardado.extension())) {
            archivos.eliminar(guardado.ruta());

            throw new IllegalArgumentException(
                "El modo libro digital solo está disponible para archivos PDF."
            );
        }

        try {
            return repository.crearMaterial(
                cursoId,
                titulo.trim(),
                descripcion,
                guardado.nombreOriginal(),
                guardado.nombreGuardado(),
                guardado.ruta(),
                guardado.tipoMime(),
                guardado.extension(),
                guardado.tamano(),
                Boolean.TRUE.equals(modoLibro),
                usuarioId(codigo)
            );
        } catch (RuntimeException e) {
            archivos.eliminar(guardado.ruta());
            throw e;
        }
    }

    public Map<String, Object> obtenerMaterial(
        Long cursoId,
        Long materialId,
        String codigo
    ) {
        exigirAccesoCurso(cursoId, codigo);

        Map<String, Object> material =
            repository.buscarMaterial(materialId);

        if (material == null
                || !cursoId.equals(
                    ((Number) material.get("curso_id")).longValue()
                )
                || !Boolean.TRUE.equals(
                    material.get("publicado")
                )) {
            throw new IllegalArgumentException(
                "El material no existe o no está publicado."
            );
        }

        return material;
    }

    @Transactional
    public void eliminarMaterial(
        Long cursoId,
        Long materialId,
        String codigo
    ) {
        exigirGestionContenido(cursoId, codigo);

        Map<String, Object> material =
            repository.buscarMaterial(materialId);

        if (material == null
                || !cursoId.equals(
                    ((Number) material.get("curso_id")).longValue()
                )) {
            throw new IllegalArgumentException(
                "El material no pertenece a este curso."
            );
        }

        archivos.eliminar(
            String.valueOf(material.get("ruta_archivo"))
        );

        repository.eliminarMaterial(materialId, cursoId);
    }

    // -----------------------------------------------------
    // TAREAS
    // -----------------------------------------------------

    public List<Map<String, Object>> listarTareas(
        Long cursoId,
        String codigo
    ) {
        exigirAccesoCurso(cursoId, codigo);

        Long alumnoId = "ALUMNO".equals(rol(codigo))
            ? usuarioId(codigo)
            : null;

        return repository.listarTareas(cursoId, alumnoId);
    }

    @Transactional
    public Long crearTarea(
        Long cursoId,
        String codigo,
        Long unidadId,
        String titulo,
        String descripcion,
        LocalDateTime fechaEntrega
    ) {
        exigirDocente(cursoId, codigo);

        validarLongitud(titulo, "Título", 180);

        if (fechaEntrega == null) {
            throw new IllegalArgumentException(
                "La fecha de entrega es obligatoria."
            );
        }

        if (unidadId != null
                && !repository.unidadPerteneceCurso(unidadId, cursoId)) {
            throw new IllegalArgumentException(
                "La unidad seleccionada no pertenece a este curso."
            );
        }

        return repository.crearTarea(
            cursoId,
            unidadId,
            titulo.trim(),
            descripcion,
            fechaEntrega,
            usuarioId(codigo)
        );
    }

    @Transactional
    public void actualizarTarea(
        Long cursoId,
        Long tareaId,
        String codigo,
        Long unidadId,
        String titulo,
        String descripcion,
        LocalDateTime fechaEntrega
    ) {
        exigirDocente(cursoId, codigo);

        Map<String, Object> tarea =
            repository.buscarTarea(tareaId);

        if (tarea == null
                || !cursoId.equals(
                    ((Number) tarea.get("curso_id")).longValue()
                )) {
            throw new IllegalArgumentException(
                "La tarea no pertenece a este curso."
            );
        }

        validarLongitud(titulo, "Título", 180);

        if (fechaEntrega == null) {
            throw new IllegalArgumentException(
                "La fecha de entrega es obligatoria."
            );
        }

        if (unidadId != null
                && !repository.unidadPerteneceCurso(unidadId, cursoId)) {
            throw new IllegalArgumentException(
                "La unidad seleccionada no pertenece a este curso."
            );
        }

        repository.actualizarTarea(
            tareaId,
            cursoId,
            unidadId,
            titulo.trim(),
            descripcion,
            fechaEntrega
        );
    }

    @Transactional
    public void eliminarTarea(
        Long cursoId,
        Long tareaId,
        String codigo
    ) {
        exigirDocente(cursoId, codigo);

        Map<String, Object> tarea =
            repository.buscarTarea(tareaId);

        if (tarea == null
                || !cursoId.equals(
                    ((Number) tarea.get("curso_id")).longValue()
                )) {
            throw new IllegalArgumentException(
                "La tarea no pertenece a este curso."
            );
        }

        repository.eliminarTarea(tareaId, cursoId);
    }

    // -----------------------------------------------------
    // ARCHIVOS DE TAREAS
    // -----------------------------------------------------

    @Transactional
    public Long subirArchivoTarea(
        Long cursoId,
        Long tareaId,
        String codigo,
        MultipartFile archivo
    ) {
        exigirDocente(cursoId, codigo);

        Map<String, Object> tarea =
            repository.buscarTarea(tareaId);

        if (tarea == null
                || !cursoId.equals(
                    ((Number) tarea.get("curso_id")).longValue()
                )) {
            throw new IllegalArgumentException(
                "La tarea no pertenece a este curso."
            );
        }

        var guardado = archivos.guardar(archivo, "tareas");

        try {
            return repository.guardarArchivoTarea(
                tareaId,
                guardado.nombreOriginal(),
                guardado.nombreGuardado(),
                guardado.ruta(),
                guardado.tipoMime(),
                guardado.tamano()
            );
        } catch (RuntimeException e) {
            archivos.eliminar(guardado.ruta());
            throw e;
        }
    }

    public List<Map<String, Object>> listarArchivosTarea(
        Long cursoId,
        Long tareaId,
        String codigo
    ) {
        validarTareaAccesible(cursoId, tareaId, codigo);

        return repository.listarArchivosTarea(tareaId);
    }

    public Map<String, Object> obtenerArchivoTarea(
        Long cursoId,
        Long archivoId,
        String codigo
    ) {
        exigirAccesoCurso(cursoId, codigo);

        Map<String, Object> archivo =
            repository.buscarArchivoTarea(archivoId);

        if (archivo == null) {
            throw new IllegalArgumentException(
                "El archivo no existe."
            );
        }

        Map<String, Object> tarea =
            repository.buscarTareaPorArchivo(archivoId);

        if (tarea == null
                || !cursoId.equals(
                    ((Number) tarea.get("curso_id")).longValue()
                )) {
            throw new SecurityException(
                "El archivo no pertenece a este curso."
            );
        }

        return archivo;
    }

    @Transactional
    public void eliminarArchivoTarea(
        Long cursoId,
        Long archivoId,
        String codigo
    ) {
        exigirDocente(cursoId, codigo);

        Map<String, Object> archivo =
            repository.buscarArchivoTarea(archivoId);

        if (archivo == null) {
            throw new IllegalArgumentException(
                "El archivo no existe."
            );
        }

        Map<String, Object> tarea =
            repository.buscarTareaPorArchivo(archivoId);

        if (tarea == null
                || !cursoId.equals(
                    ((Number) tarea.get("curso_id")).longValue()
                )) {
            throw new SecurityException(
                "El archivo no pertenece a este curso."
            );
        }

        archivos.eliminar(
            String.valueOf(archivo.get("ruta_archivo"))
        );

        repository.eliminarArchivoTarea(archivoId);
    }

    // -----------------------------------------------------
    // ENTREGAS
    // -----------------------------------------------------

    @Transactional
    public Long entregarTarea(
        Long cursoId,
        Long tareaId,
        String codigo,
        MultipartFile archivo,
        String comentario
    ) {
        exigirAlumno(cursoId, codigo);

        Map<String, Object> tarea =
            repository.buscarTarea(tareaId);

        if (tarea == null
                || !cursoId.equals(
                    ((Number) tarea.get("curso_id")).longValue()
                )) {
            throw new IllegalArgumentException(
                "La tarea no pertenece a este curso."
            );
        }

        LocalDateTime fechaEntrega =
            convertirFecha(tarea.get("fecha_entrega"));

        if (fechaEntrega != null
                && LocalDateTime.now().isAfter(fechaEntrega)) {
            throw new IllegalArgumentException(
                "El plazo de entrega de esta tarea ha vencido."
            );
        }

        var guardado = archivos.guardar(archivo, "entregas");

        try {
            return repository.guardarEntrega(
                tareaId,
                usuarioId(codigo),
                guardado.nombreOriginal(),
                guardado.nombreGuardado(),
                guardado.ruta(),
                guardado.tipoMime(),
                guardado.tamano(),
                comentario
            );
        } catch (RuntimeException e) {
            archivos.eliminar(guardado.ruta());
            throw e;
        }
    }

    public List<Map<String, Object>> listarEntregas(
        Long cursoId,
        Long tareaId,
        String codigo
    ) {
        exigirDocente(cursoId, codigo);

        Map<String, Object> tarea =
            repository.buscarTarea(tareaId);

        if (tarea == null
                || !cursoId.equals(
                    ((Number) tarea.get("curso_id")).longValue()
                )) {
            throw new IllegalArgumentException(
                "La tarea no pertenece a este curso."
            );
        }

        return repository.listarEntregas(tareaId);
    }

    @Transactional
    public void calificarEntrega(
        Long cursoId,
        Long entregaId,
        String codigo,
        BigDecimal nota,
        String observacion
    ) {
        exigirDocente(cursoId, codigo);

        if (nota == null || nota.signum() < 0) {
            throw new IllegalArgumentException(
                "La nota debe ser un número igual o mayor que cero."
            );
        }

        Map<String, Object> entrega =
            repository.buscarEntrega(entregaId);

        if (entrega == null) {
            throw new IllegalArgumentException(
                "La entrega no existe."
            );
        }

        Long tareaId =
            ((Number) entrega.get("tarea_id")).longValue();

        Map<String, Object> tarea =
            repository.buscarTarea(tareaId);

        if (tarea == null
                || !cursoId.equals(
                    ((Number) tarea.get("curso_id")).longValue()
                )) {
            throw new SecurityException(
                "La entrega no pertenece a este curso."
            );
        }

        repository.calificarEntrega(
            entregaId,
            nota,
            observacion
        );
    }

    public Map<String, Object> obtenerEntrega(
        Long cursoId,
        Long entregaId,
        String codigo
    ) {
        exigirAccesoCurso(cursoId, codigo);

        Map<String, Object> entrega =
            repository.buscarEntrega(entregaId);

        if (entrega == null) {
            throw new IllegalArgumentException(
                "La entrega no existe."
            );
        }

        Long tareaId =
            ((Number) entrega.get("tarea_id")).longValue();

        Map<String, Object> tarea =
            repository.buscarTarea(tareaId);

        if (tarea == null
                || !cursoId.equals(
                    ((Number) tarea.get("curso_id")).longValue()
                )) {
            throw new SecurityException(
                "La entrega no pertenece a este curso."
            );
        }

        if ("ALUMNO".equals(rol(codigo))
                && !usuarioId(codigo).equals(
                    ((Number) entrega.get("alumno_id")).longValue()
                )) {
            throw new SecurityException(
                "No puedes consultar la entrega de otro alumno."
            );
        }

        return entrega;
    }

    // -----------------------------------------------------
    // FORO
    // -----------------------------------------------------

    public List<Map<String, Object>> listarPublicaciones(
        Long cursoId,
        String codigo
    ) {
        exigirAccesoCurso(cursoId, codigo);

        return repository.listarPublicaciones(cursoId);
    }

    @Transactional
    public Long crearPublicacion(
        Long cursoId,
        String codigo,
        String contenido
    ) {
        exigirAccesoCurso(cursoId, codigo);

        validarLongitud(contenido, "Contenido", 5000);

        return repository.crearPublicacion(
            cursoId,
            usuarioId(codigo),
            contenido.trim()
        );
    }

    @Transactional
    public Long crearRespuesta(
        Long cursoId,
        Long publicacionId,
        String codigo,
        String contenido
    ) {
        exigirAccesoCurso(cursoId, codigo);

        validarLongitud(contenido, "Respuesta", 3000);

        Map<String, Object> publicacion =
            repository.buscarPublicacion(publicacionId);

        if (publicacion == null
                || !cursoId.equals(
                    ((Number) publicacion.get("curso_id")).longValue()
                )) {
            throw new IllegalArgumentException(
                "La publicación no pertenece a este curso."
            );
        }

        return repository.crearRespuesta(
            publicacionId,
            usuarioId(codigo),
            contenido.trim()
        );
    }

    @Transactional
    public void eliminarPublicacion(
        Long cursoId,
        Long publicacionId,
        String codigo
    ) {
        exigirAccesoCurso(cursoId, codigo);

        Map<String, Object> publicacion =
            repository.buscarPublicacion(publicacionId);

        if (publicacion == null
                || !cursoId.equals(
                    ((Number) publicacion.get("curso_id")).longValue()
                )) {
            throw new IllegalArgumentException(
                "La publicación no pertenece a este curso."
            );
        }

        Long autorId =
            ((Number) publicacion.get("usuario_id")).longValue();

        Long actualId = usuarioId(codigo);

        if (!esAdmin(codigo)
                && !esDocente(cursoId, actualId)
                && !autorId.equals(actualId)) {
            throw new SecurityException(
                "No puedes eliminar esta publicación."
            );
        }

        repository.eliminarPublicacion(publicacionId);
    }

    @Transactional
    public void eliminarRespuesta(
        Long cursoId,
        Long respuestaId,
        String codigo
    ) {
        exigirAccesoCurso(cursoId, codigo);

        Map<String, Object> respuesta =
            repository.buscarRespuesta(respuestaId);

        if (respuesta == null) {
            throw new IllegalArgumentException(
                "La respuesta no existe."
            );
        }

        Long publicacionId =
            ((Number) respuesta.get("publicacion_id")).longValue();

        Map<String, Object> publicacion =
            repository.buscarPublicacion(publicacionId);

        if (publicacion == null
                || !cursoId.equals(
                    ((Number) publicacion.get("curso_id")).longValue()
                )) {
            throw new SecurityException(
                "La respuesta no pertenece a este curso."
            );
        }

        Long actualId = usuarioId(codigo);
        Long autorId =
            ((Number) respuesta.get("usuario_id")).longValue();

        if (!esAdmin(codigo)
                && !esDocente(cursoId, actualId)
                && !autorId.equals(actualId)) {
            throw new SecurityException(
                "No puedes eliminar esta respuesta."
            );
        }

        repository.eliminarRespuesta(respuestaId);
    }

    // -----------------------------------------------------
    // UTILIDADES
    // -----------------------------------------------------

    private void exigirAlumno(Long cursoId, String codigo) {
        validarCurso(cursoId);

        if (!"ALUMNO".equals(rol(codigo))
                || !esAlumno(cursoId, usuarioId(codigo))) {
            throw new SecurityException(
                "Solo un alumno matriculado puede entregar tareas."
            );
        }
    }

    private void validarTareaAccesible(
        Long cursoId,
        Long tareaId,
        String codigo
    ) {
        exigirAccesoCurso(cursoId, codigo);

        Map<String, Object> tarea =
            repository.buscarTarea(tareaId);

        if (tarea == null
                || !cursoId.equals(
                    ((Number) tarea.get("curso_id")).longValue()
                )) {
            throw new IllegalArgumentException(
                "La tarea no pertenece a este curso."
            );
        }
    }

    private LocalDateTime convertirFecha(Object valor) {
        if (valor == null) {
            return null;
        }

        if (valor instanceof java.sql.Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }

        if (valor instanceof LocalDateTime fecha) {
            return fecha;
        }

        return LocalDateTime.parse(valor.toString().replace(" ", "T"));
    }


    // =====================================================
    // CONSULTAR ENTREGA PROPIA DEL ALUMNO
    // =====================================================

    public Map<String, Object> obtenerMiEntrega(
        Long cursoId,
        Long tareaId,
        String codigo
    ) {
        exigirAlumno(cursoId, codigo);

        Map<String, Object> tarea =
            repository.buscarTarea(tareaId);

        if (tarea == null
                || !cursoId.equals(
                    ((Number) tarea.get("curso_id")).longValue()
                )) {
            throw new IllegalArgumentException(
                "La tarea no pertenece a este curso."
            );
        }

        Long alumnoId = usuarioId(codigo);

        return repository.buscarEntregaAlumno(
            tareaId,
            alumnoId
        );
    }


    public List<Map<String, Object>> listarRespuestas(
        Long cursoId,
        Long publicacionId,
        String codigo
    ) {
        exigirAccesoCurso(cursoId, codigo);

        Map<String, Object> publicacion =
            repository.buscarPublicacion(publicacionId);

        if (publicacion == null
                || !cursoId.equals(
                    ((Number) publicacion.get("curso_id")).longValue()
                )) {
            throw new IllegalArgumentException(
                "La publicación no pertenece a este curso."
            );
        }

        return repository.listarRespuestas(publicacionId);
    }


}
