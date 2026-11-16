package com.colegio.plataforma.controller;

import com.colegio.plataforma.data.CursoAdminRequest;
import com.colegio.plataforma.service.CursoAdminService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/cursos")
@CrossOrigin(origins = "*")
public class CursoAdminController {

    private final CursoAdminService service;

    public CursoAdminController(
        CursoAdminService service
    ) {
        this.service = service;
    }

    // =====================================================
    // CURSOS
    // =====================================================

    @GetMapping
    public ResponseEntity<?> listarCursos() {

        try {
            return ResponseEntity.ok(
                service.listarCursos()
            );

        } catch (Exception e) {
            return errorServidor(e);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerCurso(
        @PathVariable Long id
    ) {

        try {
            return ResponseEntity.ok(
                service.obtenerCurso(id)
            );

        } catch (IllegalArgumentException e) {
            return errorSolicitud(e);
        } catch (Exception e) {
            return errorServidor(e);
        }
    }

    @PostMapping
    public ResponseEntity<?> crearCurso(
        @RequestBody CursoAdminRequest request
    ) {

        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.crearCurso(request));

        } catch (IllegalArgumentException e) {
            return errorSolicitud(e);
        } catch (Exception e) {
            return errorServidor(e);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCurso(
        @PathVariable Long id,
        @RequestBody CursoAdminRequest request
    ) {

        try {
            return ResponseEntity.ok(
                service.actualizarCurso(id, request)
            );

        } catch (IllegalArgumentException e) {
            return errorSolicitud(e);
        } catch (Exception e) {
            return errorServidor(e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCurso(
        @PathVariable Long id
    ) {

        try {
            service.eliminarCurso(id);

            return ResponseEntity.ok(
                Map.of(
                    "mensaje",
                    "Curso desactivado correctamente."
                )
            );

        } catch (IllegalArgumentException e) {
            return errorSolicitud(e);
        } catch (Exception e) {
            return errorServidor(e);
        }
    }

    // =====================================================
    // DOCENTES
    // =====================================================

    @GetMapping("/docentes")
    public ResponseEntity<?> listarDocentes(
        @RequestParam(required = false) String busqueda
    ) {

        try {
            return ResponseEntity.ok(
                service.listarDocentes(busqueda)
            );

        } catch (Exception e) {
            return errorServidor(e);
        }
    }

    // =====================================================
    // ESTUDIANTES
    // =====================================================

    @GetMapping("/{cursoId}/estudiantes/disponibles")
    public ResponseEntity<?> listarEstudiantesDisponibles(
        @PathVariable Long cursoId,
        @RequestParam(required = false) String busqueda
    ) {

        try {
            return ResponseEntity.ok(
                service.listarEstudiantesDisponibles(
                    cursoId,
                    busqueda
                )
            );

        } catch (IllegalArgumentException e) {
            return errorSolicitud(e);
        } catch (Exception e) {
            return errorServidor(e);
        }
    }

    @GetMapping("/{cursoId}/estudiantes")
    public ResponseEntity<?> listarEstudiantesCurso(
        @PathVariable Long cursoId
    ) {

        try {
            return ResponseEntity.ok(
                service.listarEstudiantesCurso(cursoId)
            );

        } catch (IllegalArgumentException e) {
            return errorSolicitud(e);
        } catch (Exception e) {
            return errorServidor(e);
        }
    }

    @PostMapping("/{cursoId}/estudiantes")
    public ResponseEntity<?> matricularEstudiantes(
        @PathVariable Long cursoId,
        @RequestBody List<Long> estudiantesIds
    ) {

        try {
            service.matricularEstudiantes(
                cursoId,
                estudiantesIds
            );

            return ResponseEntity.ok(
                Map.of(
                    "mensaje",
                    "Estudiantes matriculados correctamente."
                )
            );

        } catch (IllegalArgumentException e) {
            return errorSolicitud(e);
        } catch (Exception e) {
            return errorServidor(e);
        }
    }

    @DeleteMapping("/{cursoId}/estudiantes/{estudianteId}")
    public ResponseEntity<?> retirarEstudiante(
        @PathVariable Long cursoId,
        @PathVariable Long estudianteId
    ) {

        try {
            service.retirarEstudiante(
                cursoId,
                estudianteId
            );

            return ResponseEntity.ok(
                Map.of(
                    "mensaje",
                    "Estudiante retirado del curso correctamente."
                )
            );

        } catch (IllegalArgumentException e) {
            return errorSolicitud(e);
        } catch (Exception e) {
            return errorServidor(e);
        }
    }

    // =====================================================
    // RESPUESTAS DE ERROR
    // =====================================================

    private ResponseEntity<Map<String, String>> errorSolicitud(
        Exception e
    ) {
        return ResponseEntity.badRequest().body(
            Map.of("mensaje", e.getMessage())
        );
    }

    private ResponseEntity<Map<String, String>> errorServidor(
        Exception e
    ) {
        e.printStackTrace();

        return ResponseEntity.status(
            HttpStatus.INTERNAL_SERVER_ERROR
        ).body(
            Map.of(
                "mensaje",
                "Ocurrió un error interno al procesar la solicitud."
            )
        );
    }
}