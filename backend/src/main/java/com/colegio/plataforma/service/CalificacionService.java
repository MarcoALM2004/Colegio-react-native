package com.colegio.plataforma.service;

import com.colegio.plataforma.repository.CalificacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class CalificacionService {

    private final CalificacionRepository calificacionRepository;

    public CalificacionService(
            CalificacionRepository calificacionRepository) {
        this.calificacionRepository = calificacionRepository;
    }

    // Consultar estudiantes de un curso
    public List<Map<String, Object>> listarEstudiantes(
            Long cursoId,
            Long docenteId) {

        validarIdentificadores(cursoId, docenteId);

        verificarCursoDocente(cursoId, docenteId);

        return calificacionRepository.listarEstudiantesCurso(
                cursoId,
                docenteId
        );
    }

    // Consultar cursos del docente
    public List<Map<String, Object>> listarCursos(Long docenteId) {

        if (docenteId == null || docenteId <= 0) {
            throw new IllegalArgumentException(
                    "El identificador del docente no es válido."
            );
        }

        return calificacionRepository.listarCursosDocente(docenteId);
    }

    // Consultar calificaciones de un curso
    public List<Map<String, Object>> listarCalificaciones(
            Long cursoId,
            Long docenteId) {

        validarIdentificadores(cursoId, docenteId);

        verificarCursoDocente(cursoId, docenteId);

        return calificacionRepository.listarCalificacionesCurso(
                cursoId,
                docenteId
        );
    }

    // Registrar una nueva calificación
    @Transactional
    public void registrarCalificacion(
            Long alumnoId,
            Long cursoId,
            Long tareaId,
            Long docenteId,
            BigDecimal nota,
            String observacion) {

        if (alumnoId == null || alumnoId <= 0) {
            throw new IllegalArgumentException(
                    "El estudiante seleccionado no es válido."
            );
        }

        validarIdentificadores(cursoId, docenteId);
        validarNota(nota);

        verificarCursoDocente(cursoId, docenteId);

        if (!calificacionRepository.estudianteMatriculado(
                alumnoId, cursoId)) {
            throw new IllegalArgumentException(
                    "El estudiante no tiene matrícula activa en este curso."
            );
        }

        if (tareaId != null) {
            if (tareaId <= 0
                    || !calificacionRepository.tareaPerteneceCurso(
                            tareaId, cursoId)) {
                throw new IllegalArgumentException(
                        "La tarea no pertenece al curso seleccionado."
                );
            }
        }

        String observacionLimpia = limpiarObservacion(observacion);

        calificacionRepository.registrarCalificacion(
                alumnoId,
                cursoId,
                tareaId,
                docenteId,
                nota,
                observacionLimpia
        );
    }

    // Actualizar una calificación existente
    @Transactional
    public void actualizarCalificacion(
            Long id,
            Long docenteId,
            BigDecimal nota,
            String observacion) {

        if (id == null || id <= 0
                || docenteId == null || docenteId <= 0) {
            throw new IllegalArgumentException(
                    "Los identificadores no son válidos."
            );
        }

        validarNota(nota);

        int filasActualizadas =
                calificacionRepository.actualizarCalificacion(
                        id,
                        docenteId,
                        nota,
                        limpiarObservacion(observacion)
                );

        if (filasActualizadas == 0) {
            throw new IllegalArgumentException(
                    "No se encontró la calificación o no tienes permiso para modificarla."
            );
        }
    }

    private void verificarCursoDocente(
            Long cursoId,
            Long docenteId) {

        if (!calificacionRepository.cursoPerteneceDocente(
                cursoId, docenteId)) {
            throw new IllegalArgumentException(
                    "El curso no existe, está inactivo o no pertenece al docente."
            );
        }
    }

    private void validarIdentificadores(
            Long cursoId,
            Long docenteId) {

        if (cursoId == null || cursoId <= 0
                || docenteId == null || docenteId <= 0) {
            throw new IllegalArgumentException(
                    "El curso o el docente no son válidos."
            );
        }
    }

    private void validarNota(BigDecimal nota) {

        if (nota == null
                || nota.compareTo(BigDecimal.ZERO) < 0
                || nota.compareTo(new BigDecimal("20")) > 0) {
            throw new IllegalArgumentException(
                    "La nota debe estar entre 0 y 20."
            );
        }
    }

    private String limpiarObservacion(String observacion) {

        if (observacion == null || observacion.isBlank()) {
            return null;
        }

        String resultado = observacion.trim();

        if (resultado.length() > 500) {
            throw new IllegalArgumentException(
                    "La observación no puede superar los 500 caracteres."
            );
        }

        return resultado;
    }
}
