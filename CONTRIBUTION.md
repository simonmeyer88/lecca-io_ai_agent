# Contributing to Lecca.io

So you want to contribute? Maybe add an integration, fix a bug, build out new features? This is the contribution guide for the Lecca.io.

# Table of Contents

## Code of conduct

This project and everyone participating in it are governed by the Code of
Conduct which can be found in the file [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report
unacceptable behavior to support@lecca.io.

## Server Directory structure

The [server](/apps/server) runs on a Node.js framework, [NestJS](https://nestjs.com/), and is written in [Typescript](https://www.typescriptlang.org/). It is structured using modules, controllers, and services. Modules contain controllers and services. Controllers contain the api endpoints or routes that the client uses to interact with the server. Controllers do not contain any logic besides validation logic. Then they call a service to handle the request. Services interface with the database and perform the actual logic requested by the user.

The server directories you will most likely be working with are the following

- [/apps/server/src/apps/public](/apps/server/src/apps/public) - App integrations are found here. Each integration has its own folder containing an `actions` folder, `triggers` folder, and `connections` folder. The root of the folder contains the app file `<IntegrationName>.app.ts`. Each action within the actions folder follows the format `<IntegrationName>.action.ts`. And each trigger (if any) within the triggers folder follows the format `<IntegrationName>.trigger.ts`. Make sure to add the actions and triggers to the app file.

- [/apps/server/src/apps/public/workflow-apps](/apps/server/src/apps/public/workflow-apps.ts) - An object containing every app available on the platform. When you create a new integration, make sure you add it here so it can be available in the server as well as the client.

- [/apps/server/src/config/server.config.ts](/apps/server/src/config/server.config.ts) - We do not directly use `process.env` anywhere in the server besides this file. We always define a property within the `ServerConfig` object and use that instead. So if you need to add a new integration that requires a `CLIENT_SECRET` and a `CLIENT_ID`, make sure to define it within this file in the `INTEGRATIONS` property.

- [/apps/server/src/modules/ai-provider/ai-provider.service.ts](/apps/server/src/modules/ai-provider/ai-provider.service.ts) - We manually add new ai providers. If they match the openai specification we can use `createOpenAI` to create a provider instance. The reason we have to manually add them is because we have to calculate the cost in the [ai-provider-defaults.ts](/apps/server/src/modules/ai-provider/ai-provider-defaults.ts) file. But since we're open sourcing and a lot of people won't be using credits anyways when they run locally, we may be able to figure out a way to determine which providers support credits, which require api keys, and which ones are running locally or have a custom baseUrl.

- [/apps/server/prisma/schema.prisma](/apps/server/prisma/schema.prisma) - Defines the database schema using Prisma. Run `pnpm prisma migrate dev` to migrate your database with any changes you've made in the prisma schema. You can read more about prisma at [prisma.io](https://www.prisma.io/)

## UI Directory structure

The [UI](/apps/ui) is built using [React](https://react.dev/), [Typescript](https://www.typescriptlang.org/), [Tailwind](https://tailwindcss.com/), and [React Query](https://tanstack.com/query/v5/docs/framework/react/overview).

The directory structure is the following:

- [/apps/ui/src/api](/apps/ui/src/api) - All api services are found within this directory. Never make an api call without a service. Services are defined and added to the [api-library.ts](/apps/ui/src/api/api-library.ts). If you need to make an api call to the server, import `api` and use it like this: `api.agents.getList()`. It completely typed so you don't need to guess what parameters to pass. If you need to make an api call to the server within a component, use the react query hook wrapper the api library provides. You would use it like this within a component

  ```ts
  const { data: agents } = useApiQuery({
    service: 'agents',
    method: 'getList',
    apiLibraryArgs: {},
  });
  ```

  This will cache the response until it reaches the stale time (defined in [api-library.ts](/apps/ui/src/api/api-library.ts)) or until invalidated.

- [/apps/ui/src/components](/apps/ui/src/api) - All resuable components should be defined in this folder. This includes reusable forms, loaders, tables, .etc. This is also where we have our [shadcn/ui](https://ui.shadcn.com/) components defined. They are in the [apps/ui/src/components/ui](/apps/ui/src/api) directory.

- [/apps/ui/src/hooks](/apps/ui/src/api) - Define context hooks and any other hooks here. We don't use them much, but this is where you'd put them.

- [apps/ui/src/models](/apps/ui/src/models) - This is where we define all the types for the models we use throughout the platform. Any entity that is sent from the server should have a type. We define types using zod schemas and then export the type as well using `z.infer<typeof zodSchema>`.

  The reason we use zod schema is because we used to (and still may) mock all requests using zod and faker and having the zod schemas defined allowed the mock data to take the shape of the expected model. This will be useful for testing with mocked calls.

  If you are making a schema always end it with `schema`. E.g. `agentSchema`. And the type that is exported will just be `Agent`. E.g. `export type Agent = z.infer<typeof agentSchema>`

  Every property besides `id` and `name` should be optional. Since additional properties are only returned when expansions are added to the api call.

- [apps/ui/src/pages](/apps/ui/src/pages) - Every root page should have it's own folder. For example, to create the `projects` page, a `projects` folder was created and a `projects-page.tsx` file was created within there. All nested pages should be created within that `projects` folder. There's no strict structure for sub pages.

  All new pages must have a route. You can modify the routes in `apps/ui/src/router/routes.tsx`.

- [apps/ui/src/utils](/apps/ui/src/utils) - Any common utility functions should be added to this directory.

## Commits

Every commit must meet the [Conventional Commit Format](https://www.conventionalcommits.org/en/v1.0.0/)

We have a strict format for PR titles and commits that make it easier to review and automate change logs.

Commit title structure: `<type>(<scope>): <subject>`

- ### Type

  Must be one of the following:

  | type       | description                                                                                                                                      |
  | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `feat`     | A new feature. This includes new integrations, actions, triggers.                                                                                |
  | `fix`      | A bug fix.                                                                                                                                       |
  | `perf`     | Changes to improve performace.                                                                                                                   |
  | `ci`       | Changes to CI files (.github directory).                                                                                                         |
  | `test`     | Adding or modifying test files.                                                                                                                  |
  | `docs`     | Documentation changes.                                                                                                                           |
  | `refactor` | Restructuring or reorganizing the code without changing its external behavior                                                                    |
  | `build`    | Changes that affect the build system, dependencies, or external tooling that supports the building of the project                                |
  | `chore`    | Changes that are routine maintenance tasks, housekeeping, or updates that don’t modify application functionality, features, or visible behavior. |

- ### Scope (optional)

  Only required if the commit involves one of these apps.

  - `ui` - Changes to the ui app - [apps/ui](apps/ui)
  - `server` - Changes to the server app - [apps/server](apps/server)
  - `* app` - Changes or additions of any app (integration), action, or trigger. E.g. `gmail app` or `google-sheets app`. Format in lowercase referncing the app id.

- ### Subject

  Brief description of the changes

  - Capitalized imperative verb for the subject line
  - No punctuation at the end.

  Good example: `Fix performance issue in task service` or `Add new send message action in Foo app`

  Bad example: `fixed performance issue in task service.`

- ### Body (optional)

  Follow the same rules as the subject by using a capitalized imperative verb to expalain why you made this change. What was the reason. This will help reviewers understand the context and reason for your change.

## Branches

Every branch merging to main or prod must be one of the approved prefixs listed below and a brief lowercase, hyphenated suffix. E.g. `feat/google-sheets-search-action`

The source branch will be deleted after merging to `main`

### Main Branch

Uses the same commit types as the prefix

| prefix      | description                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `feat/`     | A new feature. This includes new integrations, actions, triggers.                                                                                |
| `fix/`      | A bug fix.                                                                                                                                       |
| `perf/`     | Changes to improve performace.                                                                                                                   |
| `ci/`       | Changes to CI files (.github directory).                                                                                                         |
| `test/`     | Adding or modifying test files.                                                                                                                  |
| `docs/`     | Documentation changes.                                                                                                                           |
| `refactor/` | Restructuring or reorganizing the code without changing its external behavior                                                                    |
| `build/`    | Changes that affect the build system, dependencies, or external tooling that supports the building of the project                                |
| `chore/`    | Changes that are routine maintenance tasks, housekeeping, or updates that don’t modify application functionality, features, or visible behavior. |

### Prod Branch

When merging to prod, a build is automatically kicked off to deploy to production.

| prefix     | description                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------- |
| `main`     | Typically we just merge main to prod if we don't need to cherry pick anything.                 |
| `release/` | Release branch cherry picked to merge and deploy to production.                                |
| `hotfix/`  | A branch that immediately can merge to production and skip main for quick fixes in production. |

## Pull Requests

1. Create a Pull Request

   After ensuring your commits and branch names follow the conventional commit and branch name guidelines, open a pull request (PR) to merge your changes into the main branch. Provide a clear and concise title and description for your PR, including:

   The purpose of your changes
   Any related issue numbers
   Specific areas you’d like feedback on (if applicable)

2. Automatic Checks

   Once you create a PR, our CI/CD pipeline will automatically run tests and linting checks. Ensure all tests pass and there are no linting errors. If any issues arise, address them promptly and push updates to your branch.

3. Review & Merge

   A reviewer will be notified and make sure the code meets coding standards, proper use of directory structures, adequate test coverage, and see if there are any potential improvements or optimizations that can be made.

   Once everything looks good, the PR will be merged to main.

4. Release to Production

   We don't have a strict release schedule. We'll try to do it as often as makes sense. Maybe every day or every week depending on what's been added.
