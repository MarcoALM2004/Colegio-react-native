
package com.colegio.plataforma.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Component
public class ArchivoCursoConfig {

    private static final long TAMANO_MAXIMO = 10L * 1024L * 1024L;

    private static final Set<String> CATEGORIAS_PERMITIDAS = Set.of(
        "unidades",
        "materiales",
        "tareas",
        "entregas"
    );

    private static final Set<String> EXTENSIONES_PERMITIDAS = Set.of(
        "pdf",
        "doc",
        "docx",
        "ppt",
        "pptx",
        "jpg",
        "jpeg",
        "png"
    );

    private final Path carpetaBase;

    public ArchivoCursoConfig(
        @Value("${app.uploads.cursos:./uploads/cursos}") String ruta
    ) {
        this.carpetaBase = Paths.get(ruta)
            .toAbsolutePath()
            .normalize();

        try {
            Files.createDirectories(this.carpetaBase);

            if (!Files.isDirectory(this.carpetaBase)
                    || !Files.isWritable(this.carpetaBase)) {
                throw new IllegalStateException(
                    "La carpeta de archivos de cursos no es accesible."
                );
            }
        } catch (IOException e) {
            throw new IllegalStateException(
                "No se pudo preparar la carpeta de archivos de cursos.",
                e
            );
        }
    }

    public ArchivoGuardado guardar(
        MultipartFile archivo,
        String categoria
    ) {
        validarArchivo(archivo);

        String carpetaSegura = validarCategoria(categoria);

        String nombreOriginal = obtenerNombreOriginal(archivo);

        String extension = obtenerExtension(nombreOriginal);

        validarExtension(extension);

        String nombreGuardado =
            UUID.randomUUID() + "." + extension;

        Path carpeta = carpetaBase
            .resolve(carpetaSegura)
            .normalize();

        if (!carpeta.startsWith(carpetaBase)) {
            throw new IllegalArgumentException(
                "La ruta de almacenamiento no es válida."
            );
        }

        try {
            Files.createDirectories(carpeta);

            Path destino = carpeta
                .resolve(nombreGuardado)
                .normalize();

            if (!destino.startsWith(carpeta)) {
                throw new IllegalArgumentException(
                    "El destino del archivo no es válido."
                );
            }

            try (InputStream input = archivo.getInputStream()) {
                Files.copy(
                    input,
                    destino,
                    StandardCopyOption.REPLACE_EXISTING
                );
            }

            String tipoMime = obtenerMime(extension);

            return new ArchivoGuardado(
                nombreOriginal,
                nombreGuardado,
                destino.toString(),
                tipoMime,
                extension,
                Files.size(destino)
            );

        } catch (IOException e) {
            throw new IllegalStateException(
                "No se pudo guardar el archivo.",
                e
            );
        }
    }

    private void validarArchivo(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException(
                "Debes seleccionar un archivo."
            );
        }

        if (archivo.getSize() > TAMANO_MAXIMO) {
            throw new IllegalArgumentException(
                "El archivo no puede superar los 10 MB."
            );
        }

        if (archivo.getOriginalFilename() == null
                || archivo.getOriginalFilename().isBlank()) {
            throw new IllegalArgumentException(
                "El nombre del archivo no es válido."
            );
        }
    }

    private String validarCategoria(String categoria) {
        if (categoria == null || categoria.isBlank()) {
            throw new IllegalArgumentException(
                "La categoría del archivo es obligatoria."
            );
        }

        String valor = categoria.toLowerCase(Locale.ROOT).trim();

        if (!CATEGORIAS_PERMITIDAS.contains(valor)) {
            throw new IllegalArgumentException(
                "La categoría de almacenamiento no está permitida."
            );
        }

        return valor;
    }

    private String obtenerNombreOriginal(MultipartFile archivo) {
        String nombre = archivo.getOriginalFilename();

        // Elimina cualquier ruta enviada por el cliente.
        nombre = nombre.replace("\\", "/");

        int separador = nombre.lastIndexOf("/");

        if (separador >= 0) {
            nombre = nombre.substring(separador + 1);
        }

        nombre = nombre.trim();

        if (nombre.isBlank()
                || nombre.equals(".")
                || nombre.equals("..")) {
            throw new IllegalArgumentException(
                "El nombre del archivo no es válido."
            );
        }

        if (nombre.length() > 255) {
            throw new IllegalArgumentException(
                "El nombre del archivo es demasiado largo."
            );
        }

        return nombre;
    }

    private String obtenerExtension(String nombre) {
        int punto = nombre.lastIndexOf(".");

        if (punto <= 0 || punto == nombre.length() - 1) {
            throw new IllegalArgumentException(
                "El archivo no tiene una extensión válida."
            );
        }

        return nombre.substring(punto + 1)
            .toLowerCase(Locale.ROOT);
    }

    private void validarExtension(String extension) {
        if (!EXTENSIONES_PERMITIDAS.contains(extension)) {
            throw new IllegalArgumentException(
                "Formato no permitido. Usa PDF, Word, PowerPoint o imágenes JPG/PNG."
            );
        }
    }

    private String obtenerMime(String extension) {
        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "doc" -> "application/msword";
            case "docx" ->
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "ppt" -> "application/vnd.ms-powerpoint";
            case "pptx" ->
                "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            default -> "application/octet-stream";
        };
    }

    public void eliminar(String rutaArchivo) {
        if (rutaArchivo == null || rutaArchivo.isBlank()) {
            return;
        }

        try {
            Path archivo = Paths.get(rutaArchivo)
                .toAbsolutePath()
                .normalize();

            if (!archivo.startsWith(carpetaBase)) {
                throw new IllegalArgumentException(
                    "No se permite eliminar archivos fuera de la carpeta de cursos."
                );
            }

            Files.deleteIfExists(archivo);

        } catch (IOException e) {
            throw new IllegalStateException(
                "No se pudo eliminar el archivo.",
                e
            );
        }
    }

    public Path obtenerRuta(String rutaArchivo) {
        if (rutaArchivo == null || rutaArchivo.isBlank()) {
            throw new IllegalArgumentException(
                "La ruta del archivo no es válida."
            );
        }

        Path archivo = Paths.get(rutaArchivo)
            .toAbsolutePath()
            .normalize();

        if (!archivo.startsWith(carpetaBase)
                || !Files.isRegularFile(archivo)
                || !Files.isReadable(archivo)) {
            throw new IllegalArgumentException(
                "El archivo solicitado no existe o no está disponible."
            );
        }

        return archivo;
    }

    public record ArchivoGuardado(
        String nombreOriginal,
        String nombreGuardado,
        String ruta,
        String tipoMime,
        String extension,
        long tamano
    ) {}
}
