
package com.colegio.plataforma.controller;

import com.colegio.plataforma.data.ActualizarAdminPerfilRequest;
import com.colegio.plataforma.data.AdminPerfilResponse;
import com.colegio.plataforma.service.AdminPerfilService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/perfil")
@CrossOrigin(origins = "*")
public class AdminPerfilController {

    private final AdminPerfilService adminPerfilService;

    public AdminPerfilController(AdminPerfilService adminPerfilService) {
        this.adminPerfilService = adminPerfilService;
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<?> obtener(@PathVariable String codigo) {
        try {
            AdminPerfilResponse perfil =
                    adminPerfilService.obtener(codigo);

            return ResponseEntity.ok(perfil);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }

    @PutMapping("/{codigo}")
    public ResponseEntity<?> actualizar(
            @PathVariable String codigo,
            @RequestBody ActualizarAdminPerfilRequest request) {

        try {
            AdminPerfilResponse perfil =
                    adminPerfilService.actualizar(codigo, request);

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
