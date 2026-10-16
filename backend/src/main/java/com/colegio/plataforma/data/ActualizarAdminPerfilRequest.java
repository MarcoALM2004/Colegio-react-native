
package com.colegio.plataforma.data;

public class ActualizarAdminPerfilRequest {

    private String correo;
    private String telefono;

    public ActualizarAdminPerfilRequest() {
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
}
