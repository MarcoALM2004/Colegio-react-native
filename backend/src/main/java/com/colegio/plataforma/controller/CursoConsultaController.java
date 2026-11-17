package com.colegio.plataforma.controller;

import com.colegio.plataforma.service.CursoConsultaService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cursos")
@CrossOrigin(origins = "*")
public class CursoConsultaController {

    private final CursoConsultaService service;

    public CursoConsultaController(CursoConsultaService service) {
        this.service = service;
    }

    @GetMapping("/mis-cursos")
    public ResponseEntity<List<Map<String, Object>>> listarMisCursos(
        Authentication authentication
    ) {
        String codigo = authentication.getName();

        return ResponseEntity.ok(
            service.listarMisCursos(codigo)
        );
    }
}
