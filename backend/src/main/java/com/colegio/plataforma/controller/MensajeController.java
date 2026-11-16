package com.colegio.plataforma.controller;

import com.colegio.plataforma.data.MensajeRequest;
import com.colegio.plataforma.data.MensajeResponse;
import com.colegio.plataforma.service.MensajeService;
import com.colegio.plataforma.service.NotificacionService;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequestMapping("/api/mensajes")
@CrossOrigin(origins = "*")
public class MensajeController {

    private final MensajeService mensajeService;
    private final NotificacionService notificacionService;

    public MensajeController(
        MensajeService mensajeService,
        NotificacionService notificacionService
    ) {
        this.mensajeService = mensajeService;
        this.notificacionService = notificacionService;
    }

    @GetMapping("/contactos")
    public ResponseEntity<?> listarContactos(
        @RequestParam Long usuarioId
    ) {
        try {
            return ResponseEntity.ok(
                mensajeService.listarContactos(usuarioId)
            );
        } catch (IllegalArgumentException e) {
            return errorSolicitud(e);
        } catch (Exception e) {
            return errorServidor(e);
        }
    }

    @GetMapping("/conversacion")
    public ResponseEntity<?> obtenerConversacion(
        @RequestParam Long usuarioId,
        @RequestParam Long contactoId
    ) {
        try {
            return ResponseEntity.ok(
                mensajeService.obtenerConversacion(
                    usuarioId,
                    contactoId
                )
            );
        } catch (IllegalArgumentException e) {
            return errorSolicitud(e);
        } catch (Exception e) {
            return errorServidor(e);
        }
    }

    @PostMapping
    public ResponseEntity<?> enviarMensaje(
        @RequestBody MensajeRequest request
    ) {
        try {
            MensajeResponse respuesta =
                mensajeService.enviarMensaje(request);

            notificacionService.notificarMensaje(
                respuesta.remitenteId(),
                respuesta.destinatarioId(),
                respuesta.id(),
                respuesta.contenido()
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(respuesta);

        } catch (IllegalArgumentException e) {
            return errorSolicitud(e);
        } catch (Exception e) {
            return errorServidor(e);
        }
    }

    @PostMapping(
        value = "/imagen",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> enviarImagen(
        @RequestParam Long remitenteId,
        @RequestParam Long destinatarioId,
        @RequestPart("archivo") MultipartFile archivo
    ) {
        try {
            MensajeResponse respuesta =
                mensajeService.enviarImagen(
                    remitenteId,
                    destinatarioId,
                    archivo
                );

            notificacionService.notificarMensaje(
                respuesta.remitenteId(),
                respuesta.destinatarioId(),
                respuesta.id(),
                respuesta.contenido()
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(respuesta);

        } catch (IllegalArgumentException e) {
            return errorSolicitud(e);
        } catch (Exception e) {
            return errorServidor(e);
        }
    }

    @GetMapping("/archivos/{nombreArchivo:.+}")
    public ResponseEntity<?> obtenerImagen(
        @PathVariable String nombreArchivo
    ) {
        try {
            Path ruta =
                mensajeService.obtenerRutaImagen(nombreArchivo);

            Resource recurso = new UrlResource(ruta.toUri());

            String tipo = Files.probeContentType(ruta);

            MediaType mediaType = tipo != null
                ? MediaType.parseMediaType(tipo)
                : MediaType.APPLICATION_OCTET_STREAM;

            return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "inline; filename=\"" + nombreArchivo + "\""
                )
                .body(recurso);

        } catch (IllegalArgumentException e) {
            return errorSolicitud(e);
        } catch (Exception e) {
            return errorServidor(e);
        }
    }

    @PutMapping("/{mensajeId}/leido")
    public ResponseEntity<?> marcarLeido(
        @PathVariable Long mensajeId,
        @RequestParam Long usuarioId
    ) {
        try {
            mensajeService.marcarMensajeLeido(
                mensajeId,
                usuarioId
            );

            return ResponseEntity.ok(
                Map.of("mensaje", "Mensaje marcado como leído.")
            );

        } catch (IllegalArgumentException e) {
            return errorSolicitud(e);
        } catch (Exception e) {
            return errorServidor(e);
        }
    }

    private ResponseEntity<Map<String, String>> errorSolicitud(
        Exception e
    ) {
        return ResponseEntity.badRequest().body(
            Map.of("mensaje", e.getMessage())
        );
    }

    private ResponseEntity<Map<String, String>> errorServidor(
        Exception e
    ) {
        e.printStackTrace();

        return ResponseEntity.status(
            HttpStatus.INTERNAL_SERVER_ERROR
        ).body(
            Map.of(
                "mensaje",
                "Ocurrió un error interno al procesar la solicitud."
            )
        );
    }
}