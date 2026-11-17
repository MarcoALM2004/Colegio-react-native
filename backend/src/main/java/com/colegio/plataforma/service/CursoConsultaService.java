package com.colegio.plataforma.service;

import com.colegio.plataforma.repository.CursoConsultaRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
public class CursoConsultaService {

    private final CursoConsultaRepository repository;

    public CursoConsultaService(CursoConsultaRepository repository) {
        this.repository = repository;
    }

    public List<Map<String, Object>> listarMisCursos(String codigo) {

        if (codigo == null || codigo.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "No se pudo identificar al usuario."
            );
        }

        String rol = repository.obtenerRolPorCodigo(codigo)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "El usuario no existe o está inactivo."
            ));

        switch (rol) {
            case "DOCENTE":
                return repository.listarCursosDocente(codigo);

            case "ALUMNO":
                return repository.listarCursosEstudiante(codigo);

            default:
                throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Este usuario no tiene permiso para consultar cursos."
                );
        }
    }
}
