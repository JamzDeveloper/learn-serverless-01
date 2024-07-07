
# Instrucciones de Instalación

Sigue estos pasos para configurar el proyecto localmente.

## 1. Instalar Dependencias

Primero, instala las dependencias del proyecto ejecutando:

```npm install```

## 2. Instalar Serverless
Para trabajar con Serverless, necesitas instalarlo globalmente en tu máquina:

```npm install -g serverless```

## 3. Descargar DynamoDB Local
Para simular DynamoDB localmente, descarga DynamoDB Local:

https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html

luego agrega a la raiz del proyecto la carpeta .dynamodb

## 4. Ejecutar el Comando de SLS Offline Start
Finalmente, para iniciar el proyecto localmente con Serverless Offline, ejecuta:

```sls offline start ```

## 5 Hacer deploy con el siguiente comando

```serverless deploy```