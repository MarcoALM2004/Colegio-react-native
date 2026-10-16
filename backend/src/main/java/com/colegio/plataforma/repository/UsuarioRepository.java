package com.colegio.plataforma.repository;

import com.colegio.plataforma.data.PerfilResponse;
import com.colegio.plataforma.models.Usuario;
import com.colegio.plataforma.data.AdminPerfilResponse;

import com.colegio.plataforma.data.UsuarioAdminResponse;
import com.colegio.plataforma.data.ActualizarUsuarioAdminRequest;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class UsuarioRepository {

    private final JdbcTemplate jdbcTemplate;

    public UsuarioRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // CONSULTAS EXISTENTES DEL LOGIN: SE CONSERVAN

    public Optional<Usuario> buscarPorIdentificador(
            String identificador) {

        List<Usuario> usuarios = jdbcTemplate.query("""
            SELECT u.id, u.codigo, u.nombres, u.apellidos,
                   u.correo, r.nombre AS rol
            FROM usuarios u
            INNER JOIN roles r ON r.id = u.rol_id
            WHERE (u.codigo = ? OR u.correo = ?)
              AND u.activo = 1
            LIMIT 1
            """,
            (rs, rowNum) -> new Usuario(
                rs.getLong("id"),
                rs.getString("codigo"),
                rs.getString("nombres"),
                rs.getString("apellidos"),
                rs.getString("correo"),
                rs.getString("rol")
            ),
            identificador, identificador
        );

        return usuarios.stream().findFirst();
    }

    public String buscarContrasena(String identificador) {
        List<String> resultados = jdbcTemplate.query("""
            SELECT u.password_hash
            FROM usuarios u
            WHERE u.codigo = ? OR u.correo = ?
            LIMIT 1
            """,
            (rs, rowNum) -> rs.getString("password_hash"),
            identificador, identificador
        );

        return resultados.isEmpty() ? null : resultados.get(0);
    }

    // NUEVO: CONSULTAR PERFIL POR CÓDIGO

    public Optional<PerfilResponse> buscarPerfilPorCodigo(
            String codigo) {

        List<PerfilResponse> resultados = jdbcTemplate.query("""
            SELECT u.id, u.codigo, u.nombres, u.apellidos,
                   u.correo, u.telefono, r.nombre AS rol
            FROM usuarios u
            INNER JOIN roles r ON r.id = u.rol_id
            WHERE u.codigo = ?
              AND u.activo = 1
            LIMIT 1
            """,
            (rs, rowNum) -> new PerfilResponse(
                rs.getLong("id"),
                rs.getString("codigo"),
                rs.getString("nombres"),
                rs.getString("apellidos"),
                rs.getString("correo"),
                rs.getString("telefono"),
                rs.getString("rol")
            ),
            codigo
        );

        return resultados.stream().findFirst();
    }

    //Admin
    public Optional<AdminPerfilResponse> buscarPerfilAdministrador(
            String codigo) {

        List<AdminPerfilResponse> resultados = jdbcTemplate.query("""
            SELECT u.id, u.codigo, u.nombres, u.apellidos,
                u.correo, u.telefono, u.activo, u.creado_en,
                r.nombre AS rol
            FROM usuarios u
            INNER JOIN roles r ON r.id = u.rol_id
            WHERE u.codigo = ?
            AND UPPER(r.nombre) = 'ADMIN'
            AND u.activo = 1
            LIMIT 1
            """,
            (rs, rowNum) -> {
                java.sql.Timestamp fecha = rs.getTimestamp("creado_en");

                return new AdminPerfilResponse(
                    rs.getLong("id"),
                    rs.getString("codigo"),
                    rs.getString("nombres"),
                    rs.getString("apellidos"),
                    rs.getString("correo"),
                    rs.getString("telefono"),
                    rs.getString("rol"),
                    rs.getBoolean("activo"),
                    fecha != null ? fecha.toLocalDateTime().toString() : null
                );
            },
            codigo
        );

        return resultados.stream().findFirst();
    }

    public int actualizarContactoAdministrador(
            String codigo,
            String correo,
            String telefono) {

        return jdbcTemplate.update("""
            UPDATE usuarios u
            INNER JOIN roles r ON r.id = u.rol_id
            SET u.correo = ?,
                u.telefono = ?
            WHERE u.codigo = ?
            AND UPPER(r.nombre) = 'ADMIN'
            AND u.activo = 1
            """,
            correo,
            telefono,
            codigo
        );
    }

    // NUEVO: COMPROBAR SI EL CORREO YA PERTENECE
    // A OTRO USUARIO ACTIVO

    public boolean existeCorreoEnOtroUsuario(
            String correo,
            String codigo) {

        if (correo == null) {
            return false;
        }

        Integer cantidad = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM usuarios
            WHERE correo = ?
              AND codigo <> ?
              AND activo = 1
            """,
            Integer.class,
            correo,
            codigo
        );

        return cantidad != null && cantidad > 0;
    }

    // NUEVO: ACTUALIZAR DATOS DEL PERFIL

    public int actualizarPerfil(
            String codigo,
            String nombres,
            String apellidos,
            String correo,
            String telefono) {

        return jdbcTemplate.update("""
            UPDATE usuarios
            SET nombres = ?,
                apellidos = ?,
                correo = ?,
                telefono = ?
            WHERE codigo = ?
              AND activo = 1
            """,
            nombres,
            apellidos,
            correo,
            telefono,
            codigo
        );
    
    }


    public boolean existeDni(String dni) {
        Integer cantidad = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM usuarios WHERE dni = ?",
            Integer.class,
            dni
        );

        return cantidad != null && cantidad > 0;
    }

    public boolean existeCorreo(String correo) {
        Integer cantidad = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM usuarios WHERE correo = ?",
            Integer.class,
            correo
        );

        return cantidad != null && cantidad > 0;
    }


    public String generarSiguienteCodigo(String prefijo) {
        Integer siguiente = jdbcTemplate.queryForObject("""
            SELECT COALESCE(
                MAX(CAST(SUBSTRING(codigo, 2) AS UNSIGNED)),
                0
            ) + 1
            FROM usuarios
            WHERE codigo REGEXP ?
            """,
            Integer.class,
            "^" + prefijo + "[0-9]{5}$"
        );

        if (siguiente == null) {
            siguiente = 1;
        }

        if (siguiente > 99999) {
            throw new IllegalStateException(
                "Se agotaron los códigos disponibles para el rol " + prefijo
            );
        }

        return prefijo + String.format("%05d", siguiente);
    }


    public void insertarUsuario(
            String codigo,
            String nombres,
            String apellidos,
            String correo,
            String dni,
            String telefono,
            String grado,
            String seccion,
            String passwordHash,
            String nombreRol) {

        Long rolId = jdbcTemplate.query("""
            SELECT id
            FROM roles
            WHERE UPPER(nombre) = UPPER(?)
            LIMIT 1
            """,
            (rs, rowNum) -> rs.getLong("id"),
            nombreRol
        ).stream().findFirst().orElse(null);

        if (rolId == null) {
            throw new IllegalArgumentException(
                "No existe el rol '" + nombreRol
                + "' en la tabla roles."
            );
        }


        jdbcTemplate.update("""
            INSERT INTO usuarios (
                codigo, nombres, apellidos, correo, dni,
                telefono, grado, seccion, password_hash,
                rol_id, activo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """,
            codigo,
            nombres,
            apellidos,
            correo,
            dni,
            telefono == null || telefono.isBlank() ? null : telefono,
            grado,
            seccion,
            passwordHash,
            rolId
        );
    }


    public List<UsuarioAdminResponse> listarUsuariosAdmin() {
        return jdbcTemplate.query("""
            SELECT u.id, u.codigo, u.nombres, u.apellidos,
                u.correo, u.dni, u.telefono, r.nombre AS rol,
                u.activo, u.grado, u.seccion, u.especialidad
            FROM usuarios u
            INNER JOIN roles r ON r.id = u.rol_id
            ORDER BY u.id DESC
            """,
            (rs, rowNum) -> new UsuarioAdminResponse(
                rs.getLong("id"),
                rs.getString("codigo"),
                rs.getString("nombres"),
                rs.getString("apellidos"),
                rs.getString("correo"),
                rs.getString("dni"),
                rs.getString("telefono"),
                rs.getString("rol"),
                rs.getBoolean("activo"),
                rs.getString("grado"),
                rs.getString("seccion"),
                rs.getString("especialidad")
            )
        );
    }

    public Optional<UsuarioAdminResponse> buscarUsuarioAdmin(String codigo) {
        List<UsuarioAdminResponse> resultados = jdbcTemplate.query("""
            SELECT u.id, u.codigo, u.nombres, u.apellidos,
                u.correo, u.dni, u.telefono, r.nombre AS rol,
                u.activo, u.grado, u.seccion, u.especialidad
            FROM usuarios u
            INNER JOIN roles r ON r.id = u.rol_id
            WHERE u.codigo = ?
            LIMIT 1
            """,
            (rs, rowNum) -> new UsuarioAdminResponse(
                rs.getLong("id"),
                rs.getString("codigo"),
                rs.getString("nombres"),
                rs.getString("apellidos"),
                rs.getString("correo"),
                rs.getString("dni"),
                rs.getString("telefono"),
                rs.getString("rol"),
                rs.getBoolean("activo"),
                rs.getString("grado"),
                rs.getString("seccion"),
                rs.getString("especialidad")
            ),
            codigo
        );

        return resultados.stream().findFirst();
    }


    public int actualizarUsuarioAdmin(
            String codigo,
            ActualizarUsuarioAdminRequest datos) {

        return jdbcTemplate.update("""
            UPDATE usuarios
            SET nombres = ?,
                apellidos = ?,
                correo = ?,
                dni = ?,
                telefono = ?,
                grado = ?,
                seccion = ?,
                especialidad = ?,
                password_hash = COALESCE(?, password_hash)
            WHERE codigo = ?
            """,
            datos.nombres(),
            datos.apellidos(),
            datos.correo(),
            datos.dni(),
            datos.telefono(),
            datos.grado(),
            datos.seccion(),
            datos.especialidad(),
            datos.password(),
            codigo
        );
    }


    public boolean existeCorreoEnOtroCodigo(String correo, String codigo) {
        Integer cantidad = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM usuarios
            WHERE correo = ? AND codigo <> ?
            """,
            Integer.class,
            correo,
            codigo
        );

        return cantidad != null && cantidad > 0;
    }

    public boolean existeDniEnOtroCodigo(String dni, String codigo) {
        Integer cantidad = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM usuarios
            WHERE dni = ? AND codigo <> ?
            """,
            Integer.class,
            dni,
            codigo
        );

        return cantidad != null && cantidad > 0;
    }

    public void insertarUsuario(
            String codigo,
            String nombres,
            String apellidos,
            String correo,
            String dni,
            String telefono,
            String grado,
            String seccion,
            String especialidad,
            String passwordHash,
            String nombreRol) {

        Long rolId = jdbcTemplate.query("""
            SELECT id
            FROM roles
            WHERE UPPER(nombre) = UPPER(?)
            LIMIT 1
            """,
            (rs, rowNum) -> rs.getLong("id"),
            nombreRol
        ).stream().findFirst().orElse(null);

        if (rolId == null) {
            throw new IllegalArgumentException(
                "No existe el rol '" + nombreRol
                + "' en la tabla roles."
            );
        }

        jdbcTemplate.update("""
            INSERT INTO usuarios (
                codigo,
                nombres,
                apellidos,
                correo,
                dni,
                telefono,
                grado,
                seccion,
                especialidad,
                password_hash,
                rol_id,
                activo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """,
            codigo,
            nombres,
            apellidos,
            correo,
            dni,
            telefono == null || telefono.isBlank() ? null : telefono,
            grado,
            seccion,
            especialidad,
            passwordHash,
            rolId
        );
    }

    public int eliminarUsuarioAdmin(String codigo) {
        return jdbcTemplate.update(
            "DELETE FROM usuarios WHERE codigo = ?",
            codigo
        );
    }
    


}