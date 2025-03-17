/* eslint-disable */
export function emailVerificationTemplate(
  firstname: string,
  verificationLink: string,
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación de Correo Electrónico</title>
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
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background-color: #007BFF;
            color: #ffffff;
            text-decoration: none;
            font-weight: 600;
            border-radius: 5px;
            transition: background 0.3s;
        }
        .button:hover {
            background-color: #0056b3;
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
        <h1>Verificación de Correo Electrónico</h1>
        <p>Hola ${firstname},</p>
        <p>Gracias por registrarte. Para completar tu registro y verificar tu dirección de correo electrónico, haz clic en el siguiente botón:</p>
        <a href="${verificationLink}" class="button">Verificar Correo Electrónico</a>
        <p class="footer">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador: <br>
        <a href="${verificationLink}">${verificationLink}</a></p>
        <p class="footer">Si no has solicitado esta verificación, puedes ignorar este correo.</p>
    </div>
</body>
</html>`;
}
