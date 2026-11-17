package com.colegio.plataforma.service;

import com.colegio.plataforma.data.CursoAdminRequest;
import com.colegio.plataforma.data.CursoAdminResponse;
import com.colegio.plataforma.repository.CursoAdminRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class CursoAdminService {

    private final CursoAdminRepository repository;

    private static final List<String> COLORES = List.of(
        "blue", "green", "orange", "purple",
        "red", "pink", "cyan", "indigo"
    );

    // Iconos permitidos para los cursos.
    private static final List<String> ICONOS = List.of(
        "book-outline",
        "book",
        "calculator-outline",
        "flask-outline",
        "globe-outline",
        "earth-outline",
        "language-outline",
        "school-outline",
        "library-outline",
        "pencil-outline",
        "color-palette-outline",
        "musical-notes-outline",
        "laptop-outline",
        "desktop-outline",
        "code-slash-outline",
        "bulb-outline",
        "leaf-outline",
        "heart-outline",
        "football-outline",
        "fitness-outline",
        "mic-outline",
        "camera-outline",
        "map-outline",
        "time-outline"
    );

    public CursoAdminService(CursoAdminRepository repository) {
        this.repository = repository;
    }

    // =====================================================
    // CURSOS
    // =====================================================

    public List<CursoAdminResponse> listarCursos() {
        return repository.listar();
    }

    public CursoAdminResponse obtenerCurso(Long id) {
        validarId(id);

        return repository.buscarPorId(id)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "El curso no existe o está inactivo."
                )
            );
    }

    @Transactional
    public CursoAdminResponse crearCurso(CursoAdminRequest request) {
        validarDatosCurso(request);

        if (repository.existeCurso(
            request.nivel().trim(),
            normalizarGrado(request.grado()),
            request.seccion().trim().toUpperCase(),
            null
        )) {
            throw new IllegalArgumentException(
                "Ya existe un curso con ese nivel, grado y sección."
            );
        }

        Long id = repository.crear(normalizarRequest(request));

        return obtenerCurso(id);
    }

    @Transactional
    public CursoAdminResponse actualizarCurso(
        Long id,
        CursoAdminRequest request
    ) {
        validarId(id);
        validarDatosCurso(request);
        obtenerCurso(id);

        if (repository.existeCurso(
            request.nivel().trim(),
            normalizarGrado(request.grado()),
            request.seccion().trim().toUpperCase(),
            id
        )) {
            throw new IllegalArgumentException(
                "Ya existe otro curso con ese nivel, grado y sección."
            );
        }

        int actualizados = repository.actualizar(
            id,
            normalizarRequest(request)
        );

        if (actualizados == 0) {
            throw new IllegalArgumentException(
                "No se pudo actualizar el curso."
            );
        }

        return obtenerCurso(id);
    }

    @Transactional
    public void eliminarCurso(Long id) {
        validarId(id);

        int eliminados = repository.eliminar(id);

        if (eliminados == 0) {
            throw new IllegalArgumentException(
                "El curso no existe o ya está inactivo."
            );
        }
    }

    // =====================================================
    // DOCENTES
    // =====================================================

    public List<Map<String, Object>> listarDocentes(String busqueda) {
        return repository.listarDocentes(busqueda);
    }

    // =====================================================
    // ESTUDIANTES DISPONIBLES
    // =====================================================

    public List<Map<String, Object>> listarEstudiantesDisponibles(
        Long cursoId,
        String busqueda
    ) {
        validarId(cursoId);

        Map<String, Object> curso = obtenerCursoAcademico(cursoId);

        String grado = String.valueOf(curso.get("grado"));
        String seccion = String.valueOf(curso.get("seccion"));

        return repository.listarEstudiantesDisponibles(
            cursoId,
            grado,
            seccion,
            busqueda
        );
    }

    // =====================================================
    // ESTUDIANTES MATRICULADOS
    // =====================================================

    public List<Map<String, Object>> listarEstudiantesCurso(Long cursoId) {
        validarId(cursoId);
        obtenerCurso(cursoId);

        return repository.listarEstudiantesCurso(cursoId);
    }

    // =====================================================
    // MATRICULAR ESTUDIANTES
    // =====================================================

    @Transactional
    public void matricularEstudiantes(
        Long cursoId,
        List<Long> estudiantesIds
    ) {
        validarId(cursoId);
        obtenerCurso(cursoId);

        if (estudiantesIds == null || estudiantesIds.isEmpty()) {
            throw new IllegalArgumentException(
                "Selecciona al menos un estudiante."
            );
        }

        Map<String, Object> curso = obtenerCursoAcademico(cursoId);

        String grado = String.valueOf(curso.get("grado"));
        String seccion = String.valueOf(curso.get("seccion"));

        for (Long estudianteId : estudiantesIds) {
            validarId(estudianteId);

            if (!repository.estudianteValido(
                estudianteId,
                grado,
                seccion
            )) {
                throw new IllegalArgumentException(
                    "El estudiante " + estudianteId
                    + " no pertenece al grado y sección del curso."
                );
            }

            if (repository.yaMatriculado(cursoId, estudianteId)) {
                continue;
            }

            repository.matricular(cursoId, estudianteId);
        }
    }

    // =====================================================
    // RETIRAR ESTUDIANTE
    // =====================================================

    @Transactional
    public void retirarEstudiante(Long cursoId, Long estudianteId) {
        validarId(cursoId);
        validarId(estudianteId);
        obtenerCurso(cursoId);

        int retirados = repository.retirarEstudiante(
            cursoId,
            estudianteId
        );

        if (retirados == 0) {
            throw new IllegalArgumentException(
                "El estudiante no está matriculado en este curso."
            );
        }
    }

    // =====================================================
    // VALIDACIONES
    // =====================================================

    private void validarDatosCurso(CursoAdminRequest request) {
        if (request == null) {
            throw new IllegalArgumentException(
                "No se recibieron los datos del curso."
            );
        }

        String nombre = normalizar(request.nombre());
        String nivel = normalizar(request.nivel());
        String grado = normalizarGrado(request.grado());
        String seccion = normalizar(request.seccion()).toUpperCase();
        String color = normalizar(request.color()).toLowerCase();
        String icono = normalizar(request.icono());

        if (nombre.isBlank()) {
            throw new IllegalArgumentException(
                "Escribe el nombre del curso."
            );
        }

        if (nombre.length() > 150) {
            throw new IllegalArgumentException(
                "El nombre del curso no puede superar 150 caracteres."
            );
        }

        if (!nivel.equals("Primaria") && !nivel.equals("Secundaria")) {
            throw new IllegalArgumentException(
                "El nivel debe ser Primaria o Secundaria."
            );
        }

        int numeroGrado;

        try {
            numeroGrado = Integer.parseInt(
                grado.replace("°", "").trim()
            );
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                "El grado no es válido."
            );
        }

        int maximo = nivel.equals("Primaria") ? 6 : 5;

        if (numeroGrado < 1 || numeroGrado > maximo) {
            throw new IllegalArgumentException(
                "El grado no corresponde al nivel seleccionado."
            );
        }

        if (!List.of("A", "B", "C").contains(seccion)) {
            throw new IllegalArgumentException(
                "La sección debe ser A, B o C."
            );
        }

        if (request.docenteId() != null
                && !repository.docenteValido(request.docenteId())) {
            throw new IllegalArgumentException(
                "El docente seleccionado no existe o está inactivo."
            );
        }

        if (!COLORES.contains(color)) {
            throw new IllegalArgumentException(
                "El color seleccionado no es válido."
            );
        }

        if (icono.isBlank()) {
            throw new IllegalArgumentException(
                "Debes seleccionar un icono para el curso."
            );
        }

        if (request.descripcion() != null
                && request.descripcion().length() > 5000) {
            throw new IllegalArgumentException(
                "La descripción es demasiado larga."
            );
        }
    }

    private CursoAdminRequest normalizarRequest(
        CursoAdminRequest request
    ) {
        return new CursoAdminRequest(
            normalizar(request.nombre()),
            normalizar(request.nivel()),
            normalizarGrado(request.grado()),
            normalizar(request.seccion()).toUpperCase(),
            request.docenteId(),
            normalizar(request.descripcion()),
            normalizar(request.color()).toLowerCase(),
            normalizar(request.icono())
        );
    }

    private Map<String, Object> obtenerCursoAcademico(Long cursoId) {
        Map<String, Object> curso =
            repository.buscarCursoAcademico(cursoId)
                .orElseThrow(() ->
                    new IllegalArgumentException(
                        "El curso no existe."
                    )
                );

        Object activo = curso.get("activo");

        boolean estaActivo =
            activo instanceof Boolean
                ? (Boolean) activo
                : activo instanceof Number
                    && ((Number) activo).intValue() == 1;

        if (!estaActivo) {
            throw new IllegalArgumentException(
                "El curso está inactivo."
            );
        }

        return curso;
    }

    private void validarId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                "El identificador no es válido."
            );
        }
    }

    private String normalizar(String valor) {
        return valor == null ? "" : valor.trim();
    }

    private String normalizarGrado(String grado) {
        return normalizar(grado);
    }
}