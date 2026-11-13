package com.colegio.plataforma.controller;

import com.colegio.plataforma.data.CalificacionRequest;
import com.colegio.plataforma.service.CalificacionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/calificaciones")
@CrossOrigin(origins = "*")
public class CalificacionController {

    private final CalificacionService calificacionService;

    public CalificacionController(
            CalificacionService calificacionService) {
        this.calificacionService = calificacionService;
    }

    // Consultar estudiantes matriculados en un curso
    @GetMapping("/curso/{cursoId}/estudiantes")
    public ResponseEntity<?> listarEstudiantes(
            @PathVariable Long cursoId,
            @RequestParam Long docenteId) {

        try {
            return ResponseEntity.ok(
                    calificacionService.listarEstudiantes(
                            cursoId, docenteId
                    )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    // Consultar calificaciones de un curso
    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<?> listarCalificaciones(
            @PathVariable Long cursoId,
            @RequestParam Long docenteId) {

        try {
            return ResponseEntity.ok(
                    calificacionService.listarCalificaciones(
                            cursoId, docenteId
                    )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    // Registrar una calificación
    @PostMapping
    public ResponseEntity<?> registrar(
            @RequestBody CalificacionRequest request) {

        try {
            if (request == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "mensaje",
                                "No se recibieron los datos."
                        ));
            }

            calificacionService.registrarCalificacion(
                    request.alumnoId(),
                    request.cursoId(),
                    request.tareaId(),
                    request.docenteId(),
                    request.nota(),
                    request.observacion()
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "mensaje",
                            "Calificación registrada correctamente."
                    ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    // Actualizar una calificación
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @RequestBody CalificacionRequest request) {

        try {
            if (request == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "mensaje",
                                "No se recibieron los datos."
                        ));
            }

            calificacionService.actualizarCalificacion(
                    id,
                    request.docenteId(),
                    request.nota(),
                    request.observacion()
            );

            return ResponseEntity.ok(Map.of(
                    "mensaje",
                    "Calificación actualizada correctamente."
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    // Consultar cursos asignados al docente
    @GetMapping("/docente/{docenteId}/cursos")
    public ResponseEntity<?> listarCursos(
            @PathVariable Long docenteId) {

        try {
            return ResponseEntity.ok(
                    calificacionService.listarCursos(docenteId)
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }
}
