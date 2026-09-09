package com.colegio.plataforma.controller;

import com.colegio.plataforma.service.LoginService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/login")
@CrossOrigin(origins = "*")
public class LoginController {

    private final LoginService loginService;

    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }

    @PostMapping
    public String login(
            @RequestParam String email,
            @RequestParam String password) {

        if (loginService.validarLogin(email, password)) {
            return "Inicio de sesión correcto";
        }

        return "Correo o contraseña incorrectos";
    }
}