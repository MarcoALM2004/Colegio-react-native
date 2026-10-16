package com.colegio.plataforma.controller;

import com.colegio.plataforma.data.ActualizarPerfilRequest;
import com.colegio.plataforma.data.PerfilResponse;
import com.colegio.plataforma.service.PerfilService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/perfil")
@CrossOrigin(origins = "*")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<?> obtenerPerfil(
            @PathVariable String codigo) {

        try {
            PerfilResponse perfil =
                    perfilService.obtenerPerfil(codigo);

            return ResponseEntity.ok(perfil);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    @PutMapping("/{codigo}")
    public ResponseEntity<?> actualizarPerfil(
            @PathVariable String codigo,
            @RequestBody ActualizarPerfilRequest request) {

        try {
            PerfilResponse perfil =
                    perfilService.actualizarPerfil(codigo, request);

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Perfil actualizado correctamente.",
                    "perfil", perfil
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }
}