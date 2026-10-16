
package com.colegio.plataforma.controller;

import com.colegio.plataforma.data.LoginRequest;
import com.colegio.plataforma.data.LoginResponse;
import com.colegio.plataforma.models.Usuario;
import com.colegio.plataforma.service.LoginService;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/login")
@CrossOrigin(origins = "*")
public class LoginController {

    private final LoginService loginService;

    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        Usuario usuario = loginService.validarLogin(
                request.getIdentificador(),
                request.getPassword()
        );

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "mensaje",
                            "Código o contraseña incorrectos."
                    ));
        }

        return ResponseEntity.ok(
                new LoginResponse(
                        "Inicio de sesión correcto",
                        usuario
                )
        );
    }
}
