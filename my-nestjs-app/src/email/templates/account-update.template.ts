/* eslint-disable */
export function accountUpdateTemplate(firstname: string, updateType: string, updateDetails: string, accountLink: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Actualización de Cuenta</title>
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
        .update-details {
            text-align: left;
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
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
        <h1>Actualización de Cuenta</h1>
        <p>Hola ${firstname},</p>
        <p>Te informamos que se ha realizado una ${updateType} en tu cuenta.</p>
        
        <div class="update-details">
            <p><strong>Detalles del cambio:</strong></p>
            <p>${updateDetails}</p>
        </div>
        
        <p>Si has realizado este cambio, no requieres hacer nada más. Si no reconoces esta actividad, por favor revisa tu cuenta inmediatamente:</p>
        <a href="${accountLink}" class="button">Revisar Mi Cuenta</a>
        
        <p class="footer">Si necesitas ayuda o tienes preguntas, no dudes en contactar con nuestro servicio de soporte.</p>
        <p class="footer">Este es un mensaje automático, por favor no respondas a este correo.</p>
    </div>
</body>
</html>`;
}
