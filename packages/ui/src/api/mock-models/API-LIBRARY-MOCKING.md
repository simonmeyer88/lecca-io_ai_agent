# How mocking works

Every service within the api-library has a schema property that must either be a `zod object schema` or `null`. If mocking is enabled, then the response will be the `zod schema` or the schema passed in the `schemaConfig` argument of the `apiFetch` method.

To enable mocking, we currently have it set as an environment variable `VITE_MOCK_API_CALLS`. If it is "true", then the api-library will only return the mocked responses.

## Mock models

Some responses don't have an associated `zod object schema`, for those service methods, we can create mock models in the `src/api/mock-models` directory.

## Dates

Date mocking doesn't work. The library we're using can't understand a zod.string() that gets transformed into a date. So your dates will be `Invalid Date` until this is figured out
