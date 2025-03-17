# Documentación de Verificación de Email

## Descripción General

La verificación de email es un proceso de seguridad que confirma que la dirección de email proporcionada por un usuario le pertenece realmente. Este documento describe el flujo de trabajo y los endpoints disponibles para la verificación de email en nuestra aplicación.

## Flujo de Verificación

1. Un usuario se registra en la plataforma.
2. El sistema envía automáticamente un email de verificación con un token único.
3. El usuario hace clic en el enlace de verificación en su email.
4. El sistema verifica el token y marca la cuenta como verificada.
5. El usuario puede iniciar sesión con normalidad.

## Endpoints Disponibles

### 1. Verificar Email (Público)

**Endpoint:** `GET /auth/verify-email?token={token}`

**Descripción:** Este endpoint procesa el token de verificación cuando un usuario hace clic en el enlace enviado a su email.

**Parámetros de Consulta:**
- `token` (requerido): El token de verificación enviado al email del usuario.

**Respuesta Exitosa:**
```json
{
  "message": "Correo electrónico verificado con éxito"
}
```

**Respuesta de Error:**
```json
{
  "statusCode": 400,
  "message": "Token inválido o expirado"
}
```

### 2. Reenviar Email de Verificación (Público)

**Endpoint:** `POST /auth/resend-verification`

**Descripción:** Permite a los usuarios solicitar un nuevo email de verificación si no recibieron el original o si ha expirado.

**Cuerpo de la Solicitud:**
```json
{
  "email": "usuario@example.com"
}
```

**Respuesta:**
```json
{
  "message": "Si el correo existe y no está verificado, recibirá instrucciones para la verificación"
}
```

### 3. Enviar Email de Verificación (Autenticado)

**Endpoint:** `POST /auth/send-verification-email`

**Descripción:** Permite a un usuario autenticado solicitar un nuevo email de verificación para su cuenta.

**Cabeceras:**
- `Authorization: Bearer {token}` (requerido): Token JWT del usuario autenticado.

**Respuesta Exitosa:**
```json
{
  "message": "Email de verificación enviado"
}
```

**Respuesta si ya está verificado:**
```json
{
  "message": "El correo electrónico ya está verificado"
}
```

## Notas Importantes

1. Los tokens de verificación expiran después de 24 horas.
2. Los usuarios no pueden iniciar sesión hasta que verifiquen su email.
3. El proceso de verificación es importante para garantizar que solo usuarios reales se registren en la plataforma.
