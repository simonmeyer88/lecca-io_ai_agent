import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { PrismaClientExceptionFilter } from './modules/global/prisma/prisma.filter';
import { initServerConfiguration } from './config/env.config';
import { ServerConfig } from './config/server.config';
import { AppModule } from './modules/core/app/app.module';

async function bootstrap() {
  await initServerConfiguration();

  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: false,
    logger: ['error', 'fatal', 'warn'],
  });

  /* Setup swagger */
  const config = new DocumentBuilder()
    .setTitle(`${ServerConfig.PLATFORM_NAME} API`)
    .setVersion('1.0')
    .addBearerAuth()
    //Add add the tags for the controllers' ApiTags property
    //so that insomnia groups the controllers into folders
    .addTag('Auth')
    .addTag('Workspaces')
    .addTag('Workspace Users')
    .addTag('Users')
    .addTag('Workspace User Preferences')
    .addTag('Workspace Preferences')
    .addTag('Workspace Invitations')
    .addTag('Connections')
    .addTag('Workflow Apps')
    .addTag('Variables')
    .addTag('Notifications')
    .addTag('Executions')
    .addTag('Projects')
    .addTag('Project Invitations')
    .addTag('Workflows')
    .addTag('Agents')
    .addTag('Tasks')
    .addTag('Billing')
    .addTag('Knowledge')
    .addTag('Health')
    .addTag('Webhooks')
    .addTag('Workflow Templates')
    .addTag('Discovery')
    .addTag('AI Providers')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  /* Set the global validation pipes */
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  /* Set the global exception filter for Prisma exeptions */
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  await app.listen(ServerConfig.PORT);

  console.info(`\nServer is running on ${ServerConfig.SERVER_URL}`);
}
bootstrap();
