package com.colegio.plataforma.controller;

import com.colegio.plataforma.data.CrearUsuarioRequest;
import com.colegio.plataforma.data.CrearUsuarioResponse;
import com.colegio.plataforma.service.UsuarioAdminService;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioAdminController {

    private final UsuarioAdminService usuarioAdminService;

    public UsuarioAdminController(
            UsuarioAdminService usuarioAdminService) {
        this.usuarioAdminService = usuarioAdminService;
    }

    @PostMapping
    public ResponseEntity<?> crear(
            @RequestBody CrearUsuarioRequest request) {
        try {
            CrearUsuarioResponse respuesta =
                    usuarioAdminService.crear(request);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(respuesta);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", e.getMessage()));

        } catch (DuplicateKeyException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "mensaje",
                            "El DNI, correo o código ya está registrado."
                    ));
        }
    }
}
