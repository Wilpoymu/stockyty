/* eslint-disable */
export function twoFactorAuthTemplate(
  firstname: string,
  verificationCode: string,
  expirationTime: string,
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Verificación</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        h1 {
            color: #333;
            font-weight: 700;
        }
        p {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        .verification-code {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 5px;
            margin: 30px 0;
            padding: 15px;
            background-color: #f0f0f0;
            border-radius: 5px;
            display: inline-block;
        }
        .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Código de Verificación</h1>
        <p>Hola ${firstname},</p>
        <p>Has solicitado un código de verificación para acceder a tu cuenta. Utiliza el siguiente código para completar el proceso:</p>
        
        <div class="verification-code">${verificationCode}</div>
        
        <p>Este código expirará en ${expirationTime}.</p>
        
        <p class="footer">Si no has solicitado este código, por favor ignora este correo o contacta a nuestro soporte técnico inmediatamente si crees que alguien está intentando acceder a tu cuenta.</p>
        <p class="footer">Por razones de seguridad, nunca compartas este código con nadie.</p>
    </div>
</body>
</html>`;
}
