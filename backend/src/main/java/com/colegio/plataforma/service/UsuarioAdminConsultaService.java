package com.colegio.plataforma.service;

import com.colegio.plataforma.data.ActualizarUsuarioAdminRequest;
import com.colegio.plataforma.data.UsuarioAdminResponse;
import com.colegio.plataforma.repository.UsuarioRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;

@Service
public class UsuarioAdminConsultaService {

    private final UsuarioRepository repository;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public UsuarioAdminConsultaService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public List<UsuarioAdminResponse> listar() {
        return repository.listarUsuariosAdmin();
    }

    public UsuarioAdminResponse obtener(String codigo) {
        return repository.buscarUsuarioAdmin(codigo)
                .orElseThrow(() ->
                        new IllegalArgumentException("Usuario no encontrado."));
    }

    @Transactional
    public UsuarioAdminResponse actualizar(
            String codigo,
            ActualizarUsuarioAdminRequest datos) {

        UsuarioAdminResponse actual = obtener(codigo);

        if (datos == null || vacio(datos.nombres())
                || vacio(datos.apellidos())) {
            throw new IllegalArgumentException(
                    "Nombres y apellidos son obligatorios.");
        }

        String correo = limpiar(datos.correo()).toLowerCase();
        String dni = limpiar(datos.dni());

        if (!Pattern.matches(
                "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", correo)) {
            throw new IllegalArgumentException("Correo no válido.");
        }

        if (!Pattern.matches("^\\d{8}$", dni)) {
            throw new IllegalArgumentException(
                    "El DNI debe tener 8 dígitos.");
        }

        if (repository.existeCorreoEnOtroCodigo(correo, codigo)) {
            throw new IllegalArgumentException(
                    "Ese correo ya pertenece a otro usuario.");
        }

        if (repository.existeDniEnOtroCodigo(dni, codigo)) {
            throw new IllegalArgumentException(
                    "Ese DNI ya pertenece a otro usuario.");
        }

        String grado = null;
        String seccion = null;
        String especialidad = null;

        if ("ALUMNO".equalsIgnoreCase(actual.rol())) {
            grado = limpiar(datos.grado());
            seccion = limpiar(datos.seccion());

            if (grado.isBlank() || seccion.isBlank()) {
                throw new IllegalArgumentException(
                        "El estudiante debe tener grado y sección.");
            }
        } else if ("DOCENTE".equalsIgnoreCase(actual.rol())) {
            especialidad = limpiar(datos.especialidad());

            if (especialidad.isBlank()) {
                throw new IllegalArgumentException(
                        "Ingresa la especialidad del docente.");
            }
        }

        String passwordHash = null;
        String password = datos.password();

        if (password != null && !password.isBlank()) {
            if (password.length() < 8) {
                throw new IllegalArgumentException(
                        "La nueva contraseña debe tener al menos 8 caracteres.");
            }

            passwordHash = passwordEncoder.encode(password);
        }

        int filas = repository.actualizarUsuarioAdmin(
                codigo,
                new ActualizarUsuarioAdminRequest(
                        limpiar(datos.nombres()),
                        limpiar(datos.apellidos()),
                        correo,
                        dni,
                        limpiar(datos.telefono()),
                        grado,
                        seccion,
                        especialidad,
                        passwordHash
                )
        );

        if (filas == 0) {
            throw new IllegalArgumentException(
                    "No se pudo actualizar el usuario.");
        }

        return obtener(codigo);
    }

    @Transactional
    public void eliminar(String codigo) {
        obtener(codigo);

        int filas = repository.eliminarUsuarioAdmin(codigo);

        if (filas == 0) {
            throw new IllegalArgumentException(
                    "No se pudo eliminar el usuario.");
        }
    }

    private String limpiar(String valor) {
        return valor == null ? "" : valor.trim();
    }

    private boolean vacio(String valor) {
        return valor == null || valor.isBlank();
    }
}
