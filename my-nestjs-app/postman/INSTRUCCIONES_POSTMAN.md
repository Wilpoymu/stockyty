# Centralización de colecciones en Postman

## Crear un Workspace

1. Abra Postman y haga clic en el menú desplegable de Workspaces en la esquina superior izquierda
2. Seleccione "Create Workspace"
3. Nombre el workspace como "SENA ADSO API"
4. Seleccione "Personal" como tipo de workspace 
5. Haga clic en "Create Workspace"

## Importar el entorno

1. En el nuevo workspace, haga clic en "Environments" en el sidebar
2. Haga clic en "Import"
3. Arrastre o seleccione el archivo `postman_environment.json`
4. Una vez importado, haga clic en el entorno "SENA ADSO API Environment" para activarlo

## Importar la colección maestra

La forma más sencilla es importar la colección maestra que ya contiene ejemplos de todos los módulos:

1. Haga clic en "Collections" en el sidebar
2. Haga clic en "Import"
3. Arrastre o seleccione el archivo `postman_collection_master.json`
4. Una vez importado, tendrá acceso a todas las rutas categorizadas por módulo

## Organización alternativa: Importar cada módulo como una colección separada

Si prefiere tener cada módulo como una colección separada (con todas sus rutas completas):

1. Haga clic en "Collections" en el sidebar
2. Haga clic en "Import"
3. En la pestaña "Files", seleccione "Upload Files"
4. Seleccione todos los archivos de colección (`postman_collection_auth.json`, `postman_collection_users.json`, etc.)
5. Haga clic en "Import"

## Ejecutar las solicitudes

1. Asegúrese de que el servidor esté funcionando en `http://localhost:5000` (o ajuste la variable `baseUrl` en el entorno)
2. Primero ejecute la solicitud "Login" para obtener un token (se guardará automáticamente en la variable `token`)
3. Luego puede ejecutar cualquier otra solicitud que requiera autenticación

## Ventajas de usar un Workspace

- Todas sus colecciones y entornos se guardan en un solo lugar
- Puede compartir fácilmente todo el workspace con otros miembros del equipo
- Las variables de entorno se comparten entre todas las colecciones
- Puede crear flujos de trabajo automatizados entre distintas colecciones
