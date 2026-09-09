package com.colegio.plataforma.service;

import org.springframework.stereotype.Service;

@Service
public class LoginService {

    public boolean validarLogin(String email, String password) {

        return email.equals("prueba@gmail.com")
                && password.equals("123456");
    }
}