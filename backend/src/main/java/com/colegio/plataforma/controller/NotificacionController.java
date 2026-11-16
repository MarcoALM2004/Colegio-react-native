package com.colegio.plataforma.controller;

import com.colegio.plataforma.data.DispositivoNotificacionRequest;
import com.colegio.plataforma.service.NotificacionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin(origins = "*")
public class NotificacionController {

    private final NotificacionService service;

    public NotificacionController(NotificacionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> listar(
        @RequestParam Long usuarioId
    ) {
        try {
            return ResponseEntity.ok(service.listar(usuarioId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("mensaje", e.getMessage())
            );
        }
    }

    @GetMapping("/no-leidas")
    public ResponseEntity<?> contar(
        @RequestParam Long usuarioId
    ) {
        try {
            return ResponseEntity.ok(
                Map.of("total", service.contarNoLeidas(usuarioId))
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("mensaje", e.getMessage())
            );
        }
    }

    @PutMapping("/{id}/leida")
    public ResponseEntity<?> marcarLeida(
        @PathVariable Long id,
        @RequestParam Long usuarioId
    ) {
        try {
            service.marcarLeida(id, usuarioId);
            return ResponseEntity.ok(
                Map.of("mensaje", "Notificación marcada como leída.")
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("mensaje", e.getMessage())
            );
        }
    }

    @PutMapping("/leer-todas")
    public ResponseEntity<?> marcarTodas(
        @RequestParam Long usuarioId
    ) {
        try {
            service.marcarTodasLeidas(usuarioId);
            return ResponseEntity.ok(
                Map.of("mensaje", "Todas las notificaciones fueron leídas.")
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("mensaje", e.getMessage())
            );
        }
    }

    @PostMapping("/dispositivo")
    public ResponseEntity<?> registrarDispositivo(
        @RequestParam Long usuarioId,
        @RequestBody DispositivoNotificacionRequest request
    ) {
        try {
            service.registrarDispositivo(
                usuarioId,
                request.expoToken(),
                request.plataforma()
            );

            return ResponseEntity.ok(
                Map.of("mensaje", "Dispositivo registrado correctamente.")
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("mensaje", e.getMessage())
            );
        }
    }
}