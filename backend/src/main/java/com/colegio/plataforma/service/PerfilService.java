package com.colegio.plataforma.service;

import com.colegio.plataforma.data.ActualizarPerfilRequest;
import com.colegio.plataforma.data.PerfilResponse;
import com.colegio.plataforma.repository.UsuarioRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class PerfilService {

    private final UsuarioRepository usuarioRepository;

    private static final Pattern CORREO_VALIDO =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    public PerfilService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    
    public PerfilResponse obtenerPerfil(String codigo) {
        validarCodigo(codigo);

        return usuarioRepository.buscarPerfilPorCodigo(
                codigo.trim().toUpperCase(Locale.ROOT)
        ).orElseThrow(() ->
                new IllegalArgumentException(
                        "No se encontró el usuario solicitado."
                )
        );
    }

    @Transactional
    public PerfilResponse actualizarPerfil(
            String codigo,
            ActualizarPerfilRequest request) {

        validarCodigo(codigo);

        if (request == null) {
            throw new IllegalArgumentException(
                    "No se recibieron los datos del perfil."
            );
        }

        String codigoNormalizado =
                codigo.trim().toUpperCase(Locale.ROOT);

        String nombres = limpiarObligatorio(
                request.getNombres(), "Los nombres son obligatorios."
        );

        String apellidos = limpiarObligatorio(
                request.getApellidos(), "Los apellidos son obligatorios."
        );

        String correo = limpiarOpcional(request.getCorreo());
        String telefono = limpiarOpcional(request.getTelefono());

        if (nombres.length() > 100) {
            throw new IllegalArgumentException(
                    "Los nombres no pueden superar los 100 caracteres."
            );
        }

        if (apellidos.length() > 100) {
            throw new IllegalArgumentException(
                    "Los apellidos no pueden superar los 100 caracteres."
            );
        }

        if (correo != null) {
            correo = correo.toLowerCase(Locale.ROOT);

            if (correo.length() > 150
                    || !CORREO_VALIDO.matcher(correo).matches()) {
                throw new IllegalArgumentException(
                        "Ingresa un correo electrónico válido."
                );
            }

            if (usuarioRepository.existeCorreoEnOtroUsuario(
                    correo, codigoNormalizado)) {
                throw new IllegalArgumentException(
                        "Este correo ya está registrado en otra cuenta."
                );
            }
        }

        if (telefono != null && telefono.length() > 30) {
            throw new IllegalArgumentException(
                    "El teléfono no puede superar los 30 caracteres."
            );
        }

        int filasActualizadas = usuarioRepository.actualizarPerfil(
                codigoNormalizado,
                nombres,
                apellidos,
                correo,
                telefono
        );

        if (filasActualizadas == 0) {
            throw new IllegalArgumentException(
                    "No se pudo actualizar el perfil. "
                    + "Verifica que el usuario exista y esté activo."
            );
        }

        return obtenerPerfil(codigoNormalizado);
    }

    private void validarCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw new IllegalArgumentException(
                    "El código del usuario es obligatorio."
            );
        }
    }

    private String limpiarObligatorio(
            String valor,
            String mensaje) {

        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException(mensaje);
        }

        return valor.trim();
    }

    private String limpiarOpcional(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        return valor.trim();
    }
}