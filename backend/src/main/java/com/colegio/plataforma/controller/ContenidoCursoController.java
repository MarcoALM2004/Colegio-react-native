package com.colegio.plataforma.controller;

import com.colegio.plataforma.data.CalificarEntregaRequest;
import com.colegio.plataforma.data.ForoPublicacionRequest;
import com.colegio.plataforma.data.ForoRespuestaRequest;
import com.colegio.plataforma.data.MaterialRequest;
import com.colegio.plataforma.data.TareaRequest;
import com.colegio.plataforma.data.UnidadRequest;
import com.colegio.plataforma.service.ContenidoCursoService;
import com.colegio.plataforma.config.ArchivoCursoConfig;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cursos/{cursoId}/contenido")
public class ContenidoCursoController {

    private final ContenidoCursoService service;
    private final ArchivoCursoConfig archivos;

    public ContenidoCursoController(
        ContenidoCursoService service,
        ArchivoCursoConfig archivos
    ) {
        this.service = service;
        this.archivos = archivos;
    }

    private String codigo(Authentication authentication) {
        return authentication.getName();
    }

    private Map<String, Object> respuestaId(Long id) {
        return Map.of(
            "mensaje", "Operación realizada correctamente.",
            "id", id
        );
    }

    private ResponseEntity<InputStreamResource> descargarArchivo(
        Map<String, Object> datos
    ) throws IOException {

        String ruta = String.valueOf(datos.get("ruta_archivo"));
        String nombre = String.valueOf(datos.get("nombre_original"));

        Path archivo = archivos.obtenerRuta(ruta);

        String mime = datos.get("tipo_mime") != null
            ? String.valueOf(datos.get("tipo_mime"))
            : "application/octet-stream";

        MediaType mediaType;

        try {
            mediaType = MediaType.parseMediaType(mime);
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
            .contentType(mediaType)
            .contentLength(Files.size(archivo))
            .header(
                HttpHeaders.CONTENT_DISPOSITION,
                ContentDisposition.attachment()
                    .filename(nombre, java.nio.charset.StandardCharsets.UTF_8)
                    .build()
                    .toString()
            )
            .body(new InputStreamResource(Files.newInputStream(archivo)));
    }

    // =====================================================
    // UNIDADES
    // =====================================================

    @GetMapping("/unidades")
    public List<Map<String, Object>> listarUnidades(
        @PathVariable Long cursoId,
        Authentication authentication
    ) {
        return service.listarUnidades(
            cursoId,
            codigo(authentication)
        );
    }

    @PostMapping("/unidades")
    public Map<String, Object> crearUnidad(
        @PathVariable Long cursoId,
        @RequestBody UnidadRequest request,
        Authentication authentication
    ) {
        Long id = service.crearUnidad(
            cursoId,
            codigo(authentication),
            request.titulo(),
            request.descripcion(),
            request.ordenUnidad()
        );

        return respuestaId(id);
    }

    @PutMapping("/unidades/{unidadId}")
    public ResponseEntity<Void> actualizarUnidad(
        @PathVariable Long cursoId,
        @PathVariable Long unidadId,
        @RequestBody UnidadRequest request,
        Authentication authentication
    ) {
        service.actualizarUnidad(
            cursoId,
            unidadId,
            codigo(authentication),
            request.titulo(),
            request.descripcion(),
            request.ordenUnidad()
        );

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/unidades/{unidadId}")
    public ResponseEntity<Void> eliminarUnidad(
        @PathVariable Long cursoId,
        @PathVariable Long unidadId,
        Authentication authentication
    ) {
        service.eliminarUnidad(
            cursoId,
            unidadId,
            codigo(authentication)
        );

        return ResponseEntity.noContent().build();
    }

    // =====================================================
    // ARCHIVOS DE UNIDADES
    // =====================================================

    @GetMapping("/unidades/{unidadId}/archivos")
    public List<Map<String, Object>> listarArchivosUnidad(
        @PathVariable Long cursoId,
        @PathVariable Long unidadId,
        Authentication authentication
    ) {
        return service.listarArchivosUnidad(
            cursoId,
            unidadId,
            codigo(authentication)
        );
    }

    @PostMapping(
        value = "/unidades/{unidadId}/archivos",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Map<String, Object> subirArchivoUnidad(
        @PathVariable Long cursoId,
        @PathVariable Long unidadId,
        @RequestParam("archivo") MultipartFile archivo,
        Authentication authentication
    ) {
        Long id = service.subirArchivoUnidad(
            cursoId,
            unidadId,
            codigo(authentication),
            archivo
        );

        return respuestaId(id);
    }

    @GetMapping("/archivos-unidad/{archivoId}")
    public ResponseEntity<InputStreamResource> descargarArchivoUnidad(
        @PathVariable Long cursoId,
        @PathVariable Long archivoId,
        Authentication authentication
    ) throws IOException {

        Map<String, Object> datos = service.obtenerArchivoUnidad(
            cursoId,
            archivoId,
            codigo(authentication)
        );

        return descargarArchivo(datos);
    }

    @DeleteMapping("/archivos-unidad/{archivoId}")
    public ResponseEntity<Void> eliminarArchivoUnidad(
        @PathVariable Long cursoId,
        @PathVariable Long archivoId,
        Authentication authentication
    ) {
        service.eliminarArchivoUnidad(
            cursoId,
            archivoId,
            codigo(authentication)
        );

        return ResponseEntity.noContent().build();
    }

    // =====================================================
    // MATERIALES
    // =====================================================

    @GetMapping("/materiales")
    public List<Map<String, Object>> listarMateriales(
        @PathVariable Long cursoId,
        Authentication authentication
    ) {
        return service.listarMateriales(
            cursoId,
            codigo(authentication)
        );
    }

    @PostMapping(
        value = "/materiales",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Map<String, Object> crearMaterial(
        @PathVariable Long cursoId,
        @RequestParam("titulo") String titulo,
        @RequestParam(value = "descripcion", required = false) String descripcion,
        @RequestParam(value = "modoLibro", required = false) Boolean modoLibro,
        @RequestParam(value = "archivo", required = false) MultipartFile archivo,
        Authentication authentication
    ) {
        Long id = service.crearMaterial(
            cursoId,
            codigo(authentication),
            titulo,
            descripcion,
            modoLibro,
            archivo
        );

        return respuestaId(id);
    }

    @GetMapping("/materiales/{materialId}")
    public ResponseEntity<InputStreamResource> descargarMaterial(
        @PathVariable Long cursoId,
        @PathVariable Long materialId,
        Authentication authentication
    ) throws IOException {

        Map<String, Object> datos = service.obtenerMaterial(
            cursoId,
            materialId,
            codigo(authentication)
        );

        return descargarArchivo(datos);
    }

    @DeleteMapping("/materiales/{materialId}")
    public ResponseEntity<Void> eliminarMaterial(
        @PathVariable Long cursoId,
        @PathVariable Long materialId,
        Authentication authentication
    ) {
        service.eliminarMaterial(
            cursoId,
            materialId,
            codigo(authentication)
        );

        return ResponseEntity.noContent().build();
    }

    // =====================================================
    // TAREAS
    // =====================================================

    @GetMapping("/tareas")
    public List<Map<String, Object>> listarTareas(
        @PathVariable Long cursoId,
        Authentication authentication
    ) {
        return service.listarTareas(
            cursoId,
            codigo(authentication)
        );
    }

    @PostMapping("/tareas")
    public Map<String, Object> crearTarea(
        @PathVariable Long cursoId,
        @RequestBody TareaRequest request,
        Authentication authentication
    ) {
        Long id = service.crearTarea(
            cursoId,
            codigo(authentication),
            request.unidadId(),
            request.titulo(),
            request.descripcion(),
            request.fechaEntrega()
        );

        return respuestaId(id);
    }

    @PutMapping("/tareas/{tareaId}")
    public ResponseEntity<Void> actualizarTarea(
        @PathVariable Long cursoId,
        @PathVariable Long tareaId,
        @RequestBody TareaRequest request,
        Authentication authentication
    ) {
        service.actualizarTarea(
            cursoId,
            tareaId,
            codigo(authentication),
            request.unidadId(),
            request.titulo(),
            request.descripcion(),
            request.fechaEntrega()
        );

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/tareas/{tareaId}")
    public ResponseEntity<Void> eliminarTarea(
        @PathVariable Long cursoId,
        @PathVariable Long tareaId,
        Authentication authentication
    ) {
        service.eliminarTarea(
            cursoId,
            tareaId,
            codigo(authentication)
        );

        return ResponseEntity.noContent().build();
    }

    // =====================================================
    // ARCHIVOS ADJUNTOS DE TAREAS
    // =====================================================

    @GetMapping("/tareas/{tareaId}/archivos")
    public List<Map<String, Object>> listarArchivosTarea(
        @PathVariable Long cursoId,
        @PathVariable Long tareaId,
        Authentication authentication
    ) {
        return service.listarArchivosTarea(
            cursoId,
            tareaId,
            codigo(authentication)
        );
    }

    @PostMapping(
        value = "/tareas/{tareaId}/archivos",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Map<String, Object> subirArchivoTarea(
        @PathVariable Long cursoId,
        @PathVariable Long tareaId,
        @RequestParam("archivo") MultipartFile archivo,
        Authentication authentication
    ) {
        Long id = service.subirArchivoTarea(
            cursoId,
            tareaId,
            codigo(authentication),
            archivo
        );

        return respuestaId(id);
    }

    @GetMapping("/archivos-tarea/{archivoId}")
    public ResponseEntity<InputStreamResource> descargarArchivoTarea(
        @PathVariable Long cursoId,
        @PathVariable Long archivoId,
        Authentication authentication
    ) throws IOException {

        Map<String, Object> datos = service.obtenerArchivoTarea(
            cursoId,
            archivoId,
            codigo(authentication)
        );

        return descargarArchivo(datos);
    }

    @DeleteMapping("/archivos-tarea/{archivoId}")
    public ResponseEntity<Void> eliminarArchivoTarea(
        @PathVariable Long cursoId,
        @PathVariable Long archivoId,
        Authentication authentication
    ) {
        service.eliminarArchivoTarea(
            cursoId,
            archivoId,
            codigo(authentication)
        );

        return ResponseEntity.noContent().build();
    }

    // =====================================================
    // ENTREGA DE TAREAS - ALUMNO
    // =====================================================

    @PostMapping(
        value = "/tareas/{tareaId}/entregas",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Map<String, Object> entregarTarea(
        @PathVariable Long cursoId,
        @PathVariable Long tareaId,
        @RequestParam("archivo") MultipartFile archivo,
        @RequestParam(value = "comentario", required = false) String comentario,
        Authentication authentication
    ) {
        Long id = service.entregarTarea(
            cursoId,
            tareaId,
            codigo(authentication),
            archivo,
            comentario
        );

        return respuestaId(id);
    }

    // =====================================================
    // ENTREGAS - DOCENTE
    // =====================================================

    @GetMapping("/tareas/{tareaId}/entregas")
    public List<Map<String, Object>> listarEntregas(
        @PathVariable Long cursoId,
        @PathVariable Long tareaId,
        Authentication authentication
    ) {
        return service.listarEntregas(
            cursoId,
            tareaId,
            codigo(authentication)
        );
    }

    @PutMapping("/entregas/{entregaId}/calificar")
    public ResponseEntity<Void> calificarEntrega(
        @PathVariable Long cursoId,
        @PathVariable Long entregaId,
        @RequestBody CalificarEntregaRequest request,
        Authentication authentication
    ) {
        service.calificarEntrega(
            cursoId,
            entregaId,
            codigo(authentication),
            request.nota(),
            request.observacionDocente()
        );

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/entregas/{entregaId}/archivo")
    public ResponseEntity<InputStreamResource> descargarEntrega(
        @PathVariable Long cursoId,
        @PathVariable Long entregaId,
        Authentication authentication
    ) throws IOException {

        Map<String, Object> datos = service.obtenerEntrega(
            cursoId,
            entregaId,
            codigo(authentication)
        );

        return descargarArchivo(datos);
    }

    // =====================================================
    // FORO
    // =====================================================

    @GetMapping("/foro")
    public List<Map<String, Object>> listarPublicaciones(
        @PathVariable Long cursoId,
        Authentication authentication
    ) {
        return service.listarPublicaciones(
            cursoId,
            codigo(authentication)
        );
    }

    @PostMapping("/foro")
    public Map<String, Object> crearPublicacion(
        @PathVariable Long cursoId,
        @RequestBody ForoPublicacionRequest request,
        Authentication authentication
    ) {
        Long id = service.crearPublicacion(
            cursoId,
            codigo(authentication),
            request.contenido()
        );

        return respuestaId(id);
    }

    @GetMapping("/foro/{publicacionId}/respuestas")
    public List<Map<String, Object>> listarRespuestas(
        @PathVariable Long cursoId,
        @PathVariable Long publicacionId,
        Authentication authentication
    ) {
        return service.listarRespuestas(
            cursoId,
            publicacionId,
            codigo(authentication)
        );
    }

    @PostMapping("/foro/{publicacionId}/respuestas")
    public Map<String, Object> crearRespuesta(
        @PathVariable Long cursoId,
        @PathVariable Long publicacionId,
        @RequestBody ForoRespuestaRequest request,
        Authentication authentication
    ) {
        Long id = service.crearRespuesta(
            cursoId,
            publicacionId,
            codigo(authentication),
            request.contenido()
        );

        return respuestaId(id);
    }

    @DeleteMapping("/foro/{publicacionId}")
    public ResponseEntity<Void> eliminarPublicacion(
        @PathVariable Long cursoId,
        @PathVariable Long publicacionId,
        Authentication authentication
    ) {
        service.eliminarPublicacion(
            cursoId,
            publicacionId,
            codigo(authentication)
        );

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/foro/respuestas/{respuestaId}")
    public ResponseEntity<Void> eliminarRespuesta(
        @PathVariable Long cursoId,
        @PathVariable Long respuestaId,
        Authentication authentication
    ) {
        service.eliminarRespuesta(
            cursoId,
            respuestaId,
            codigo(authentication)
        );

        return ResponseEntity.noContent().build();
    }
}
