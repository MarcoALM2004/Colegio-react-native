package com.colegio.plataforma.service;

import com.colegio.plataforma.data.AdminPerfilResponse;
import com.colegio.plataforma.data.ActualizarAdminPerfilRequest;
import com.colegio.plataforma.repository.UsuarioRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class AdminPerfilService {

    private final UsuarioRepository usuarioRepository;

    private static final Pattern CORREO_VALIDO =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    public AdminPerfilService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public AdminPerfilResponse obtener(String codigo) {
        String codigoLimpio = normalizarCodigo(codigo);

        return usuarioRepository.buscarPerfilAdministrador(codigoLimpio)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No se encontró un administrador activo."
                        )
                );
    }

    @Transactional
    public AdminPerfilResponse actualizar(
            String codigo,
            ActualizarAdminPerfilRequest request) {

        String codigoLimpio = normalizarCodigo(codigo);

        if (request == null) {
            throw new IllegalArgumentException(
                    "No se recibieron los datos del perfil."
            );
        }

        String correo = limpiar(request.getCorreo());
        String telefono = limpiar(request.getTelefono());

        if (correo != null) {
            correo = correo.toLowerCase(Locale.ROOT);

            if (correo.length() > 150
                    || !CORREO_VALIDO.matcher(correo).matches()) {
                throw new IllegalArgumentException(
                        "Ingresa un correo electrónico válido."
                );
            }

            if (usuarioRepository.existeCorreoEnOtroUsuario(
                    correo, codigoLimpio)) {
                throw new IllegalArgumentException(
                        "Este correo ya pertenece a otro usuario."
                );
            }
        }

        if (telefono != null && telefono.length() > 30) {
            throw new IllegalArgumentException(
                    "El teléfono no puede superar los 30 caracteres."
            );
        }

        // Verifica que el código pertenezca a un administrador activo.
        obtener(codigoLimpio);

        int filas = usuarioRepository.actualizarContactoAdministrador(
                codigoLimpio,
                correo,
                telefono
        );

        if (filas == 0) {
            // Puede que los datos enviados sean idénticos a los actuales.
            return obtener(codigoLimpio);
        }

        return obtener(codigoLimpio);
    }

    private String normalizarCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw new IllegalArgumentException(
                    "El código del administrador es obligatorio."
            );
        }

        return codigo.trim().toUpperCase(Locale.ROOT);
    }

    private String limpiar(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        return valor.trim();
    }
}
