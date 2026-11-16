package com.colegio.plataforma.service;

import com.colegio.plataforma.data.MensajeContactoResponse;
import com.colegio.plataforma.data.MensajeRequest;
import com.colegio.plataforma.data.MensajeResponse;
import com.colegio.plataforma.repository.MensajeRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class MensajeService {

    private final MensajeRepository mensajeRepository;

    @Value("${app.uploads.mensajes:./uploads/mensajes}")
    private String directorioConfigurado;

    private static final long MAXIMO_IMAGEN = 10L * 1024L * 1024L;

    public MensajeService(MensajeRepository mensajeRepository) {
        this.mensajeRepository = mensajeRepository;
    }

    private Path obtenerDirectorioImagenes() {
        return Path.of(directorioConfigurado)
                .toAbsolutePath()
                .normalize();
    }

    public List<MensajeContactoResponse> listarContactos(
            Long usuarioId) {

        validarUsuario(usuarioId);

        return mensajeRepository.listarContactos(usuarioId);
    }

    @Transactional
    public List<MensajeResponse> obtenerConversacion(
            Long usuarioId,
            Long contactoId) {

        validarRelacion(usuarioId, contactoId);

        mensajeRepository.marcarConversacionLeida(
                usuarioId,
                contactoId
        );

        return mensajeRepository.listarConversacion(
                usuarioId,
                contactoId
        );
    }

    @Transactional
    public MensajeResponse enviarMensaje(MensajeRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "No se recibieron los datos del mensaje."
            );
        }

        Long remitenteId = request.remitenteId();
        Long destinatarioId = request.destinatarioId();

        validarRelacion(remitenteId, destinatarioId);

        if (request.contenido() == null
                || request.contenido().isBlank()) {
            throw new IllegalArgumentException(
                    "El mensaje no puede estar vacío."
            );
        }

        String contenido = request.contenido().trim();

        if (contenido.length() > 5000) {
            throw new IllegalArgumentException(
                    "El mensaje no puede superar los 5000 caracteres."
            );
        }

        String asunto = request.asunto();

        if (asunto != null) {
            asunto = asunto.trim();

            if (asunto.isEmpty()) {
                asunto = null;
            }

            if (asunto != null && asunto.length() > 180) {
                throw new IllegalArgumentException(
                        "El asunto no puede superar los 180 caracteres."
                );
            }
        }

        Long mensajeId = mensajeRepository.guardarMensaje(
                remitenteId,
                destinatarioId,
                asunto,
                contenido
        );

        return mensajeRepository.buscarPorId(mensajeId);
    }

    @Transactional
    public MensajeResponse enviarImagen(
            Long remitenteId,
            Long destinatarioId,
            MultipartFile archivo) {

        validarRelacion(remitenteId, destinatarioId);

        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException(
                    "No se recibió ninguna fotografía."
            );
        }

        if (archivo.getSize() > MAXIMO_IMAGEN) {
            throw new IllegalArgumentException(
                    "La fotografía no puede superar los 10 MB."
            );
        }

        String tipo = archivo.getContentType();

        if (tipo == null) {
            throw new IllegalArgumentException(
                    "No se pudo identificar el formato de la fotografía."
            );
        }

        tipo = tipo.toLowerCase(Locale.ROOT).split(";")[0].trim();

        String extension = obtenerExtension(tipo);
        String nombreArchivo = UUID.randomUUID() + extension;

        Path directorio = obtenerDirectorioImagenes();
        Path destino = directorio.resolve(nombreArchivo).normalize();

        if (!destino.startsWith(directorio)) {
            throw new IllegalArgumentException(
                    "La ruta del archivo no es válida."
            );
        }

        try {
            Files.createDirectories(directorio);

            try (var entrada = archivo.getInputStream()) {
                Files.copy(
                        entrada,
                        destino,
                        StandardCopyOption.REPLACE_EXISTING
                );
            }

            String archivoUrl =
                    "/api/mensajes/archivos/" + nombreArchivo;

            try {
                Long mensajeId = mensajeRepository.guardarImagen(
                        remitenteId,
                        destinatarioId,
                        archivoUrl
                );

                return mensajeRepository.buscarPorId(mensajeId);

            } catch (RuntimeException e) {
                // Si falla MySQL, elimina la fotografía recién guardada.
                Files.deleteIfExists(destino);
                throw e;
            }

        } catch (IOException e) {
            throw new IllegalStateException(
                    "No se pudo guardar la fotografía en el servidor.",
                    e
            );
        }
    }

    public Path obtenerRutaImagen(String nombreArchivo) {

        if (nombreArchivo == null
                || !nombreArchivo.matches(
                        "[a-fA-F0-9-]+\\.(jpg|jpeg|png|webp|gif)"
                )) {
            throw new IllegalArgumentException(
                    "El nombre del archivo no es válido."
            );
        }

        Path directorio = obtenerDirectorioImagenes();

        Path ruta = directorio
                .resolve(nombreArchivo)
                .normalize();

        if (!ruta.startsWith(directorio)
                || !Files.exists(ruta)
                || !Files.isRegularFile(ruta)) {
            throw new IllegalArgumentException(
                    "La fotografía no existe."
            );
        }

        return ruta;
    }

    private String obtenerExtension(String tipo) {

        return switch (tipo) {
            case "image/jpeg", "image/jpg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> throw new IllegalArgumentException(
                    "Formato de imagen no permitido. Usa JPG, PNG o WEBP."
            );
        };
    }

    @Transactional
    public void marcarMensajeLeido(
            Long mensajeId,
            Long usuarioId) {

        validarUsuario(usuarioId);

        if (mensajeId == null || mensajeId <= 0) {
            throw new IllegalArgumentException(
                    "El identificador del mensaje no es válido."
            );
        }

        int actualizados = mensajeRepository.marcarMensajeLeido(
                mensajeId,
                usuarioId
        );

        if (actualizados == 0) {
            throw new IllegalArgumentException(
                    "El mensaje no existe, ya fue leído o no te pertenece."
            );
        }
    }

    private void validarUsuario(Long usuarioId) {

        if (usuarioId == null || usuarioId <= 0) {
            throw new IllegalArgumentException(
                    "El identificador del usuario no es válido."
            );
        }

        if (!mensajeRepository.usuarioActivo(usuarioId)) {
            throw new IllegalArgumentException(
                    "El usuario no existe o está inactivo."
            );
        }
    }

    private void validarRelacion(
            Long usuarioId,
            Long contactoId) {

        validarUsuario(usuarioId);

        if (contactoId == null || contactoId <= 0) {
            throw new IllegalArgumentException(
                    "El identificador del contacto no es válido."
            );
        }

        if (usuarioId.equals(contactoId)) {
            throw new IllegalArgumentException(
                    "No puedes enviarte mensajes a ti mismo."
            );
        }

        if (!mensajeRepository.existeRelacionPermitida(
                usuarioId,
                contactoId)) {

            throw new IllegalArgumentException(
                    "No puedes comunicarte con este usuario. "
                            + "Debe existir una relación académica activa."
            );
        }
    }
}
