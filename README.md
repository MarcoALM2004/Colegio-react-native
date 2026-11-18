# EDUCONNECT MOBILE
## Aplicación móvil para la gestión académica y la comunicación escolar

### 1. Presentación del proyecto

EduConnect Mobile es una aplicación móvil desarrollada con el propósito de facilitar la gestión académica y mejorar la comunicación entre estudiantes, docentes y administradores de una institución educativa.

La aplicación reúne en un solo entorno diferentes herramientas que permiten consultar cursos, revisar materiales, realizar actividades académicas, visualizar calificaciones y mantener comunicación mediante mensajes y notificaciones. Asimismo, cuenta con un módulo administrativo para gestionar usuarios y cursos.

El proyecto está desarrollado con React Native y Expo para la aplicación móvil. El backend está implementado con Java y Spring Boot, y utiliza una base de datos MySQL para almacenar la información. La comunicación entre el frontend y el backend se realiza mediante servicios REST.

### 2. Objetivo

Desarrollar una aplicación móvil que permita centralizar los principales procesos académicos y de comunicación escolar, brindando a cada usuario acceso a las funciones que corresponden a su perfil.

### 3. Funcionalidades principales

#### 3.1. Módulo del estudiante

El estudiante puede iniciar sesión y acceder a las opciones habilitadas para su perfil. Entre las principales funciones se encuentran:

- Consultar los cursos en los que se encuentra matriculado.
- Revisar las unidades y los materiales publicados por sus docentes.
- Consultar las tareas y registrar sus entregas.
- Revisar las calificaciones disponibles.
- Participar en el foro de sus cursos.
- Enviar y recibir mensajes.
- Consultar las notificaciones.
- Visualizar y actualizar la información de su perfil, de acuerdo con las operaciones disponibles.

#### 3.2. Módulo del docente

El docente cuenta con herramientas para organizar y realizar el seguimiento de las actividades académicas de sus cursos. Entre ellas se consideran:

- Consultar los cursos que tiene asignados.
- Crear y administrar unidades de aprendizaje.
- Publicar materiales y tareas.
- Revisar las entregas realizadas por los estudiantes.
- Registrar o actualizar calificaciones.
- Consultar las publicaciones y conversaciones del foro.
- Utilizar el módulo de mensajería y revisar las notificaciones.
- Consultar su información de perfil.

#### 3.3. Módulo del administrador

El administrador dispone de opciones para gestionar la información general de la plataforma. Este módulo contempla:

- Consultar el panel principal.
- Registrar, consultar, actualizar y eliminar usuarios, según los permisos implementados.
- Gestionar los cursos.
- Asignar docentes responsables.
- Consultar y administrar los estudiantes matriculados en cada curso.
- Consultar y actualizar la información de su perfil.

#### 3.4. Funciones del dispositivo móvil

La aplicación incorpora bibliotecas que permiten utilizar funciones propias del dispositivo, entre ellas la cámara, la selección de imágenes, el acceso a documentos y las notificaciones. Estas capacidades requieren permisos del sistema operativo y deben validarse en un dispositivo compatible.

### 4. Tecnologías utilizadas

Para el desarrollo de EduConnect Mobile se utilizaron las siguientes tecnologías:

**Frontend móvil**

- React Native 0.88.1.
- Expo SDK 58.
- JavaScript y React 19.3.0.
- React Navigation 7 para la navegación entre pantallas.
- AsyncStorage para el almacenamiento local de información de sesión.
- expo-camera y expo-image-picker para la cámara y selección de imágenes.
- expo-document-picker, expo-file-system y expo-sharing para el manejo de documentos.
- expo-notifications para la integración de notificaciones.

**Backend**

- Java 26.
- Spring Boot 4.1.1.
- Spring Web para la creación de servicios REST.
- Spring Security para la seguridad y el control de acceso.
- JJWT 0.12.6 para el manejo de tokens JWT.
- Spring JDBC para el acceso a datos.
- Maven para la gestión y construcción del proyecto.

**Base de datos**

- MySQL.

Las versiones indicadas corresponden a las declaradas en los archivos de configuración revisados del proyecto.

### 5. Organización del proyecto

El repositorio se encuentra dividido en dos carpetas principales: `frontend` y `backend`.

La carpeta `frontend` contiene el código de la aplicación móvil. Dentro de `src` se encuentran las siguientes áreas:

- `components`: componentes reutilizables de la interfaz.
- `config`: configuración general, incluida la conexión con la API.
- `context`: contextos para compartir información entre pantallas.
- `data`: datos utilizados por algunas vistas y procesos de demostración.
- `navigation`: configuración de la navegación según el perfil del usuario.
- `pages`: pantallas principales de la aplicación.
- `service`: funciones encargadas de comunicarse con los servicios del backend.
- `style`: archivos de estilos.
- `theme`: recursos relacionados con la presentación visual.
- `utils`: funciones auxiliares.

La carpeta `backend` contiene el servidor desarrollado con Spring Boot. El código Java se organiza dentro del paquete `com.colegio.plataforma`, que incluye componentes de configuración, controladores, objetos de transferencia de datos, modelos, repositorios y servicios.

Esta organización permite separar las responsabilidades de la aplicación móvil y del servidor, facilitando el mantenimiento y la modificación de sus módulos.

### 6. Requisitos para ejecutar el proyecto

Antes de iniciar la aplicación, se debe contar con los siguientes programas y herramientas:

- Node.js y npm compatibles con la versión de Expo utilizada.
- JDK 26, de acuerdo con la versión declarada en el backend.
- MySQL.
- Android Studio y Android SDK, si se desea ejecutar la aplicación en un emulador Android.
- Un dispositivo Android compatible para realizar pruebas físicas.
- Git, en caso de clonar el repositorio.

Para ejecutar la aplicación en iOS se requiere macOS y Xcode.

### 7. Configuración de la base de datos

Primero, se debe iniciar el servicio de MySQL y crear la base de datos que utiliza el proyecto.

```sql
CREATE DATABASE educonnect;
```

Después, se debe preparar el esquema correspondiente, incluyendo las tablas necesarias para usuarios, roles, cursos, calificaciones, tareas y demás módulos utilizados por la aplicación.

La conexión con MySQL se configura en el archivo:

`backend/src/main/resources/application.properties`

Se deben revisar y completar las propiedades de conexión con los datos del entorno local. Por ejemplo:

- properties
spring.datasource.url=jdbc:mysql://localhost:3306/educonnect
spring.datasource.username=TU_USUARIO_MYSQL
spring.datasource.password=TU_PASSWORD_MYSQL
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver


Los valores del ejemplo deben reemplazarse por las credenciales del equipo donde se ejecutará el proyecto.

Es importante considerar que la configuración revisada establece `spring.sql.init.mode=never`. Por ello, no se debe asumir que Spring Boot creará automáticamente todas las tablas. La base de datos debe contar previamente con el esquema requerido.

No se deben publicar contraseñas ni información privada en el repositorio.

### 8. Ejecución del backend

Para iniciar el servidor, se debe abrir una terminal y acceder a la carpeta `backend`.

En Linux o macOS, ejecutar:

```bash
./mvnw spring-boot:run
```

En Windows, ejecutar:

```bat
mvnw.cmd spring-boot:run
```

Una vez iniciado, se debe revisar la consola para comprobar que Spring Boot haya levantado correctamente y que la conexión con MySQL se haya realizado sin errores.

De manera predeterminada, el backend utiliza el puerto 8080, siempre que no se haya modificado su configuración.

### 9. Ejecución del frontend móvil

En otra terminal, acceder a la carpeta `frontend` e instalar las dependencias:

```bash
npm install
```

Luego, revisar el archivo:

`frontend/src/config/api.js`

En este archivo se encuentra la configuración de la dirección base del backend. Se debe colocar una dirección IP que pueda ser alcanzada desde el dispositivo o emulador donde se ejecutará la aplicación.

Como referencia, la configuración debe apuntar al servidor y al puerto correspondiente:

```javascript
export const API_URL = 'http://IP_DE_TU_SERVIDOR:8080';
```

La dirección anterior es solo un ejemplo. Debe reemplazarse por la IP real del equipo que ejecuta Spring Boot.

Cuando se utilice un celular físico, tanto el teléfono como la computadora deben tener conectividad entre sí. Además, se debe permitir la conexión mediante el firewall. No se debe utilizar `localhost` como dirección del backend desde el celular, porque esa dirección haría referencia al propio dispositivo móvil.

Para iniciar Expo, ejecutar:

```bash
npx expo start
```

También se pueden utilizar los comandos definidos en `frontend/package.json`, según el entorno:

```bash
npm start
npm run android
npm run ios
npm run web
```

La ejecución de iOS requiere macOS y Xcode. Para probar funciones nativas y notificaciones push, se debe utilizar un dispositivo o un development build compatible, ya que Expo Go tiene limitaciones para determinadas funciones.

### 10. Inicio de sesión y seguridad

El inicio de sesión se realiza mediante el endpoint:

`POST /login`

Cuando las credenciales son válidas, el backend genera un token JWT que permite identificar al usuario en las solicitudes posteriores.

En el frontend, el token se almacena localmente mediante AsyncStorage, utilizando la clave `@educonnect_token`. El archivo `frontend/src/config/api.js` centraliza las solicitudes HTTP y agrega la cabecera de autorización cuando se necesita acceder a una ruta protegida.

La cabecera utilizada tiene el siguiente formato:

```http
Authorization: Bearer <token>
```

La configuración de seguridad del backend utiliza un esquema sin estado (`STATELESS`) y establece restricciones de acceso según las rutas y los roles.

Entre las reglas identificadas se encuentran:

- Las rutas `/api/admin/**` requieren el rol de administrador.
- Las rutas `/api/calificaciones/**` requieren el rol de docente.
- Las rutas protegidas bajo `/api/**` requieren autenticación.
- Las solicitudes sin autenticación pueden recibir una respuesta HTTP 401.
- Las solicitudes realizadas por un usuario sin permisos suficientes pueden recibir una respuesta HTTP 403.

Estas condiciones deben comprobarse durante las pruebas utilizando cuentas de los distintos perfiles.

### 11. Servicios principales

El backend expone diferentes controladores REST y el frontend cuenta con servicios que permiten consumir sus operaciones.

Entre los módulos identificados se encuentran:

- **Autenticación:** `LoginController` y `authService.js`.
- **Perfil:** `PerfilController` y `perfilService.js`.
- **Usuarios:** controladores administrativos y `adminUsuariosService.js`.
- **Cursos:** controladores de administración y consulta, junto con sus servicios del frontend.
- **Contenido del curso:** `ContenidoCursoController` y `contenidoCursoService.js`.
- **Calificaciones:** `CalificacionController`.
- **Mensajería:** `MensajeController` y `mensajeService.js`.
- **Notificaciones:** `NotificacionController` y `notificacionService.js`.

Algunas de las rutas principales identificadas son:

**Autenticación**

`POST /login`

**Cursos**

`GET /api/cursos/mis-cursos`

**Administración**

`GET /api/admin/usuarios`

`POST /api/admin/usuarios`

`GET /api/admin/cursos`

`POST /api/admin/cursos`

**Foro**

`GET /api/cursos/{cursoId}/contenido/foro`

`POST /api/cursos/{cursoId}/contenido/foro`

`GET /api/cursos/{cursoId}/contenido/foro/{publicacionId}/respuestas`

`POST /api/cursos/{cursoId}/contenido/foro/{publicacionId}/respuestas`

**Mensajería**

`GET /api/mensajes/contactos`

`GET /api/mensajes/conversacion`

`POST /api/mensajes`

**Notificaciones**

`GET /api/notificaciones`

`POST /api/notificaciones/dispositivo`

Las rutas anteriores son una referencia de las operaciones identificadas. Para conocer todos los parámetros, formatos de solicitud y respuestas, se deben revisar los controladores y servicios correspondientes.

### 12. Manejo de archivos y notificaciones

El proyecto contempla el manejo de archivos asociados a los cursos y a la mensajería. En el backend se encuentra una configuración para almacenar archivos en directorios específicos y establecer restricciones sobre el tamaño y los tipos de archivos permitidos.

Por otro lado, el módulo de notificaciones permite consultar las notificaciones del usuario y realizar operaciones relacionadas con su estado de lectura. También existe una integración con Expo para el registro del dispositivo y el envío de notificaciones push.

La recepción efectiva de notificaciones depende de los permisos del sistema operativo, de la configuración de Expo y de que el dispositivo se encuentre correctamente registrado. Por ese motivo, esta funcionalidad debe probarse antes de considerarla completamente validada.

### 13. Pruebas y validación

Para comprobar el funcionamiento de EduConnect Mobile, se recomienda realizar pruebas con los tres perfiles del sistema: estudiante, docente y administrador.

Las principales verificaciones que se deben realizar son:

1. Iniciar sesión con una cuenta de cada perfil.
2. Intentar iniciar sesión con credenciales incorrectas.
3. Comprobar que las rutas protegidas no permitan el acceso a usuarios sin autenticación.
4. Verificar que cada rol solo pueda ingresar a las funciones que le corresponden.
5. Consultar cursos y revisar sus contenidos.
6. Publicar información en el foro y consultar las conversaciones.
7. Registrar una entrega y comprobar el proceso de calificación.
8. Enviar y recibir mensajes.
9. Probar los permisos de cámara y realizar una captura.
10. Registrar el dispositivo y comprobar la recepción de una notificación.
11. Revisar la presentación de las pantallas en diferentes tamaños de dispositivo.

Para cada prueba es recomendable registrar la fecha, el dispositivo utilizado, el perfil de usuario, los pasos realizados, el resultado esperado y el resultado obtenido. También se pueden adjuntar capturas o videos como evidencia, evitando mostrar contraseñas o tokens.

### 14. Consideraciones y aspectos pendientes

Durante la revisión del proyecto se identificaron algunos aspectos que deben tenerse en cuenta:

- Los controladores `CambioPasswordController` y `CalendarioController` se encuentran en el repositorio, pero no presentan una implementación funcional identificable en la versión revisada. Por ello, no se deben considerar funciones terminadas sin una implementación y prueba adicional.
- La recepción de notificaciones push debe comprobarse en un dispositivo compatible.
- Algunas áreas del frontend contienen datos de demostración. Es importante distinguirlas de las funciones que ya consumen información del backend.
- La dirección de conexión con la API debe adaptarse al equipo y a la red donde se ejecute el proyecto.
- Se debe mantener disponible el esquema de MySQL para facilitar la instalación en otros equipos.
- Es necesario completar las pruebas de integración y registrar evidencias antes de afirmar que todos los módulos funcionan correctamente.

### 15. Recomendaciones de seguridad

Antes de compartir cambios en el repositorio, se recomienda revisar que no se incluyan contraseñas de MySQL, secretos JWT, tokens de servicios externos ni archivos privados de configuración.

Las credenciales deben mantenerse en la configuración local del entorno y no deben publicarse en GitHub. También se recomienda revisar los archivos de configuración de servicios externos antes de compartir el proyecto.

### 16. Integrantes del proyecto

**Proyecto:** EduConnect Mobile  
**Institución:** Universidad Tecnológica del Perú  
**Carrera:** Ingeniería de Software

**Integrantes:**

- Toledo Portal, Cesar Vladimir.
- Guevara Morales, Antonio Nicolás.
- Leon Moreno, Marco Antonio.

**Asesor:** David William Cota Sencara.

### 17. Licencia y uso

EduConnect Mobile es un proyecto desarrollado con fines académicos. En la versión revisada del repositorio no se identificó un archivo de licencia específico para su distribución.
