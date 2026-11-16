package com.colegio.plataforma.service;

import com.colegio.plataforma.data.NotificacionResponse;
import com.colegio.plataforma.repository.NotificacionRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificacionService {

    private static final String EXPO_PUSH_URL =
        "https://exp.host/--/api/v2/push/send";

    private final NotificacionRepository repository;
    private final RestClient expoClient;

    public NotificacionService(
        NotificacionRepository repository
    ) {
        this.repository = repository;
        this.expoClient = RestClient.create();
    }

    public List<NotificacionResponse> listar(Long usuarioId) {
        validarUsuario(usuarioId);
        return repository.listar(usuarioId, 100);
    }

    public int contarNoLeidas(Long usuarioId) {
        validarUsuario(usuarioId);
        return repository.contarNoLeidas(usuarioId);
    }

    public void marcarLeida(Long id, Long usuarioId) {
        validarUsuario(usuarioId);

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                "El identificador de la notificación no es válido."
            );
        }

        if (repository.marcarLeida(id, usuarioId) == 0) {
            throw new IllegalArgumentException(
                "La notificación no existe o no te pertenece."
            );
        }
    }

    public void marcarTodasLeidas(Long usuarioId) {
        validarUsuario(usuarioId);
        repository.marcarTodasLeidas(usuarioId);
    }

    public void registrarDispositivo(
        Long usuarioId,
        String token,
        String plataforma
    ) {
        validarUsuario(usuarioId);

        if (token == null ||
            !token.matches("ExponentPushToken\\[[^\\]]+\\]")) {
            throw new IllegalArgumentException(
                "El token de Expo no es válido."
            );
        }

        repository.registrarDispositivo(
            usuarioId,
            token,
            plataforma == null ? "desconocida" : plataforma
        );
    }

    private void validarUsuario(Long usuarioId) {
        if (usuarioId == null || usuarioId <= 0 ||
            !repository.usuarioActivo(usuarioId)) {
            throw new IllegalArgumentException(
                "El usuario no existe o está inactivo."
            );
        }
    }

    // Se ejecuta cuando un usuario envía un mensaje.
    public void notificarMensaje(
        Long remitenteId,
        Long destinatarioId,
        Long mensajeId,
        String contenido
    ) {
        validarUsuario(destinatarioId);

        String texto = contenido == null
            ? ""
            : contenido.trim();

        if (texto.isBlank()) {
            texto = "Te ha enviado una fotografía.";
        }

        if (texto.length() > 140) {
            texto = texto.substring(0, 137) + "...";
        }

        String titulo = "Nuevo mensaje";

        // Guardar la notificación en el sistema interno.
        repository.guardar(
            destinatarioId,
            "MENSAJE",
            titulo,
            texto,
            mensajeId,
            "Mensajes",
            "MENSAJE-" + mensajeId + "-" + destinatarioId
        );

        // Enviar la notificación push al dispositivo.
        enviarPush(
            destinatarioId,
            titulo,
            texto,
            mensajeId
        );
    }

    private void enviarPush(
        Long usuarioId,
        String titulo,
        String contenido,
        Long mensajeId
    ) {
        List<String> tokens =
            repository.obtenerTokens(usuarioId);

        for (String token : tokens) {
            try {
                Map<String, Object> data = new HashMap<>();
                data.put("tipo", "MENSAJE");
                data.put("referenciaId", mensajeId);
                data.put("pantalla", "Mensajes");

                Map<String, Object> push = new HashMap<>();
                push.put("to", token);
                push.put("sound", "default");
                push.put("title", titulo);
                push.put("body", contenido);
                push.put("data", data);
                push.put("priority", "high");
                push.put("channelId", "educonnect");

                Map<?, ?> respuesta = expoClient.post()
                    .uri(EXPO_PUSH_URL)
                    .header("Accept", "application/json")
                    .header("Content-Type", "application/json")
                    .body(push)
                    .retrieve()
                    .body(Map.class);

                System.out.println(
                    "Respuesta Expo Push para usuario " +
                    usuarioId + ": " + respuesta
                );

            } catch (Exception e) {
                System.err.println(
                    "Error enviando push al usuario " +
                    usuarioId + ": " + e.getMessage()
                );
            }
        }
    }
}
