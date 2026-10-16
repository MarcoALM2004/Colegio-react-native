package com.colegio.plataforma.controller;

import com.colegio.plataforma.data.ActualizarUsuarioAdminRequest;
import com.colegio.plataforma.service.UsuarioAdminConsultaService;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioAdminConsultaController {

    private final UsuarioAdminConsultaService service;

    public UsuarioAdminConsultaController(
            UsuarioAdminConsultaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<?> obtener(@PathVariable String codigo) {
        try {
            return ResponseEntity.ok(service.obtener(codigo));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("mensaje", e.getMessage()));
        }
    }

    @PutMapping("/{codigo}")
    public ResponseEntity<?> actualizar(
            @PathVariable String codigo,
            @RequestBody ActualizarUsuarioAdminRequest datos) {
        try {
            return ResponseEntity.ok(service.actualizar(codigo, datos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("mensaje", e.getMessage()));
        } catch (DuplicateKeyException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "mensaje",
                    "El correo o DNI ya está registrado."
                ));
        }
    }


    @DeleteMapping("/{codigo}")
    public ResponseEntity<?> eliminar(
            @PathVariable String codigo) {
        try {
            service.eliminar(codigo);

            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("mensaje", e.getMessage()));
        }
    }

}
