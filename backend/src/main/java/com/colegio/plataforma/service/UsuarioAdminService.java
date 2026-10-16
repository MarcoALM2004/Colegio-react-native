package com.colegio.plataforma.service;

import com.colegio.plataforma.data.CrearUsuarioRequest;
import com.colegio.plataforma.data.CrearUsuarioResponse;
import com.colegio.plataforma.repository.UsuarioRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class UsuarioAdminService {

    private final UsuarioRepository usuarioRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    private final SecureRandom random = new SecureRandom();

    private static final Pattern DNI_VALIDO =
            Pattern.compile("^\\d{8}$");

    private static final Pattern CORREO_VALIDO =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    public UsuarioAdminService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public CrearUsuarioResponse crear(CrearUsuarioRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Debes enviar los datos del usuario."
            );
        }

        String rol = limpiar(request.getRol())
                .toUpperCase(Locale.ROOT);

        String nombres = limpiar(request.getNombres());
        String apellidos = limpiar(request.getApellidos());

        String correo = limpiar(request.getCorreo())
                .toLowerCase(Locale.ROOT);

        String dni = limpiar(request.getDni());
        String telefono = limpiar(request.getTelefono());
        String grado = limpiar(request.getGrado());
        String seccion = limpiar(request.getSeccion());
        String especialidad = limpiar(request.getEspecialidad());

        if (!rol.equals("A")
                && !rol.equals("C")
                && !rol.equals("E")) {
            throw new IllegalArgumentException(
                    "El rol debe ser A, C o E."
            );
        }

        if (nombres.isBlank() || apellidos.isBlank()) {
            throw new IllegalArgumentException(
                    "Los nombres y apellidos son obligatorios."
            );
        }

        if (!DNI_VALIDO.matcher(dni).matches()) {
            throw new IllegalArgumentException(
                    "El DNI debe tener exactamente 8 dígitos."
            );
        }

        if (!CORREO_VALIDO.matcher(correo).matches()) {
            throw new IllegalArgumentException(
                    "Ingresa un correo electrónico válido."
            );
        }

        if (usuarioRepository.existeDni(dni)) {
            throw new IllegalArgumentException(
                    "Ya existe un usuario con ese DNI."
            );
        }

        if (usuarioRepository.existeCorreo(correo)) {
            throw new IllegalArgumentException(
                    "Ya existe un usuario con ese correo."
            );
        }

        if (rol.equals("E")
                && (grado.isBlank() || seccion.isBlank())) {
            throw new IllegalArgumentException(
                    "El estudiante debe tener grado y sección."
            );
        }

        if (rol.equals("C") && especialidad.isBlank()) {
            throw new IllegalArgumentException(
                    "El docente debe tener una especialidad."
            );
        }

        if (!rol.equals("E")) {
            grado = null;
            seccion = null;
        }

        if (!rol.equals("C")) {
            especialidad = null;
        }

        String codigo =
                usuarioRepository.generarSiguienteCodigo(rol);

        String contrasenaTemporal =
                generarContrasenaTemporal();

        String passwordHash =
                passwordEncoder.encode(contrasenaTemporal);

        String nombreRol = switch (rol) {
            case "A" -> "ADMIN";
            case "C" -> "DOCENTE";
            case "E" -> "ALUMNO";
            default -> throw new IllegalArgumentException(
                    "Rol no válido. Usa A, C o E."
            );
        };
        

        usuarioRepository.insertarUsuario(
                codigo,
                nombres,
                apellidos,
                correo,
                dni,
                telefono,
                grado,
                seccion,
                especialidad,
                passwordHash,
                nombreRol
        );

        return new CrearUsuarioResponse(
                "Usuario creado correctamente.",
                codigo,
                nombreRol,
                nombres,
                apellidos,
                correo,
                dni,
                contrasenaTemporal
        );
    }

    private String generarContrasenaTemporal() {
        String caracteres =
                "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";

        StringBuilder resultado = new StringBuilder();

        for (int i = 0; i < 12; i++) {
            resultado.append(
                    caracteres.charAt(
                            random.nextInt(caracteres.length())
                    )
            );
        }

        return resultado.toString();
    }

    private String limpiar(String valor) {
        return valor == null ? "" : valor.trim();
    }
    
}
