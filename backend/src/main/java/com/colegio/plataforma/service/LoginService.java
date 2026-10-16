
package com.colegio.plataforma.service;

import com.colegio.plataforma.models.Usuario;
import com.colegio.plataforma.repository.UsuarioRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public LoginService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario validarLogin(
            String identificador, String password) {

        if (identificador == null || password == null
                || identificador.isBlank() || password.isBlank()) {
            return null;
        }

        String usuarioIngresado = identificador.trim();

        String contrasenaGuardada =
                usuarioRepository.buscarContrasena(usuarioIngresado);

        if (contrasenaGuardada == null) {
            return null;
        }

        boolean coincide;

        if (contrasenaGuardada.startsWith("$2a$")
                || contrasenaGuardada.startsWith("$2b$")
                || contrasenaGuardada.startsWith("$2y$")) {
            coincide = passwordEncoder.matches(
                    password, contrasenaGuardada
            );
        } else {
            // Compatibilidad temporal con cuentas antiguas
            coincide = password.equals(contrasenaGuardada);
        }

        if (!coincide) {
            return null;
        }

        return usuarioRepository
                .buscarPorIdentificador(usuarioIngresado)
                .orElse(null);
    }
}
