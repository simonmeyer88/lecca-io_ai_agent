# [0.10.0](https://github.com/lecca-digital/lecca-io/compare/v0.9.0...v0.10.0) (2024-12-18)


### Bug Fixes

* **server:** Stringify the pipe stream error when ai chat streaming ([d382a2f](https://github.com/lecca-digital/lecca-io/commit/d382a2fd22c27a6845c06cf3761c1a561701bcdf))


### Features

* **apps:** Add brave search and serper dev apps ([1f42e1f](https://github.com/lecca-digital/lecca-io/commit/1f42e1f94e2070edb1092e1d6639dc54e30d99f1))

# [0.9.0](https://github.com/lecca-digital/lecca-io/compare/v0.8.0...v0.9.0) (2024-12-18)


### Features

* **ui:** Update favicon to use new logo ([347dc3e](https://github.com/lecca-digital/lecca-io/commit/347dc3ebb8358cfa9d659cd4a5d9b4f5d17ff33e))

# [0.8.0](https://github.com/lecca-digital/lecca-io/compare/v0.7.0...v0.8.0) (2024-12-17)


### Features

* **server:** Add DEV_EMAIL_DOMAIN server config item for dev module ([7538769](https://github.com/lecca-digital/lecca-io/commit/753876986fe65b47a39e5609a3cfe26c9268b61a))
* **ui:** Remove old logo and replace with credit card on left rail ([35bd59d](https://github.com/lecca-digital/lecca-io/commit/35bd59d7b42826746823b063decd77ce4819236e))

# [0.7.0](https://github.com/lecca-digital/lecca-io/compare/v0.6.0...v0.7.0) (2024-12-17)


### Bug Fixes

* **apps:** Replace integration base url env with hardcoded string ([fff7c83](https://github.com/lecca-digital/lecca-io/commit/fff7c83437d12e853f2b9a93c61773e3ce093358))
* **ui:** Fix tailwind config to work with monorepo migration ([feb1711](https://github.com/lecca-digital/lecca-io/commit/feb171135d10fb194877e57cf58e99365ef13672))
* **ui:** Prevent auth errors from showing up in system messages in ui ([1a93ccf](https://github.com/lecca-digital/lecca-io/commit/1a93ccf50c239dc7af154e330fbd19eca3f89cef))


### Features

* **server:** Add error handler to ai chat stream ([b87e01a](https://github.com/lecca-digital/lecca-io/commit/b87e01a6fd17bfa9b367313f44fe7a56a99f1807))
* **ui:** Hide google sign in if no google client id ([ea7b792](https://github.com/lecca-digital/lecca-io/commit/ea7b79285398e709b877a16db1ea54ba0007e2a2))

# [0.6.0](https://github.com/lecca-digital/lecca-io/compare/v0.5.0...v0.6.0) (2024-12-16)


### Bug Fixes

* **apps:** Fix recurring schedule trigger inputConfig ([9076461](https://github.com/lecca-digital/lecca-io/commit/907646193abd5d2aad223813b42a44f877bbf673))


### Features

* **server:** Remove needsConnection property from app constructor args ([aa776f7](https://github.com/lecca-digital/lecca-io/commit/aa776f767df2469df798be502c7fec6ac8624266))

# [0.5.0](https://github.com/lecca-digital/lecca-io/compare/v0.4.10...v0.5.0) (2024-12-14)


### Features

* Update apps package ([a4abf52](https://github.com/lecca-digital/lecca-io/commit/a4abf524b9b335623a01d6e619d7a6e0d53977be))

## [0.4.10](https://github.com/lecca-digital/lecca-io/compare/v0.4.9...v0.4.10) (2024-12-14)


### Bug Fixes

* Update publish yml to only publish libs ([e7c3548](https://github.com/lecca-digital/lecca-io/commit/e7c354868313de04b31f867610d193e92651398d))

## [0.4.9](https://github.com/lecca-digital/lecca-io/compare/v0.4.8...v0.4.9) (2024-12-14)


### Bug Fixes

* **apps:** Make clientId and clientSecret getters ([e7b7f32](https://github.com/lecca-digital/lecca-io/commit/e7b7f32d8f5463a679f9f913b3b3ecd761e78702))

## [0.4.8](https://github.com/lecca-digital/lecca-io/compare/v0.4.7...v0.4.8) (2024-12-14)


### Bug Fixes

* Add monorepo deps in package.json for build ([36501a4](https://github.com/lecca-digital/lecca-io/commit/36501a4d234dbd93d9e42b38fc4edbc2dabf7218))
* Add monorepo deps in package.json for build ([6b042a9](https://github.com/lecca-digital/lecca-io/commit/6b042a90508be96974e68d871863a9580ef69aa0))

## [0.4.7](https://github.com/lecca-digital/lecca-io/compare/v0.4.6...v0.4.7) (2024-12-14)


### Bug Fixes

* Update main.js path in server docker ([879db8e](https://github.com/lecca-digital/lecca-io/commit/879db8edb3c3524a9b2b720b6b396d204021898c))

## [0.4.6](https://github.com/lecca-digital/lecca-io/compare/v0.4.5...v0.4.6) (2024-12-14)


### Bug Fixes

* Update types path in lib package.json for docker to work ([1070490](https://github.com/lecca-digital/lecca-io/commit/1070490078865640cf6a32da3c3c6a9d1d47275c))

## [0.4.5](https://github.com/lecca-digital/lecca-io/compare/v0.4.4...v0.4.5) (2024-12-13)


### Bug Fixes

* Add extra_plugins option to release action ([6f80f0c](https://github.com/lecca-digital/lecca-io/commit/6f80f0c35760f8815cbdebb9481c67c3faa2f0bb))
* Add plugins to yml ([319b306](https://github.com/lecca-digital/lecca-io/commit/319b3061abdde6b1fe62cd8ac8f87e9abc83666d))
* Update update-package-versions name ([fdb58ca](https://github.com/lecca-digital/lecca-io/commit/fdb58caba16cfa8258eb1b1b5f8904b54f3c5e16))
* Use semantic-release/exec to update lib package.json ([14f8d40](https://github.com/lecca-digital/lecca-io/commit/14f8d401e1af808311148908d7c19e9f2e953f10))

## [0.4.4](https://github.com/lecca-digital/lecca-io/compare/v0.4.3...v0.4.4) (2024-12-13)


### Bug Fixes

* Publish apps and toolkit ([4960454](https://github.com/lecca-digital/lecca-io/commit/4960454409fc5fcdfee6eb452a543802674e5143))

## [0.4.3](https://github.com/lecca-digital/lecca-io/compare/v0.4.2...v0.4.3) (2024-12-13)


### Bug Fixes

* Add deps to create-release.yml ([7498261](https://github.com/lecca-digital/lecca-io/commit/749826140c635acd35273f1a0dd7b81603b96317))
* Add pnpm to create-release.yml ([bac8d1f](https://github.com/lecca-digital/lecca-io/commit/bac8d1f00955d22f3c13ee9483c6bccca7236f99))
* Install @semantic-release/exec ([7f7e139](https://github.com/lecca-digital/lecca-io/commit/7f7e139d23ab4d9cb61780c13f0b3721457acb85))
* Remove semantic exec ([311efc6](https://github.com/lecca-digital/lecca-io/commit/311efc65c12cea6da1f28edaf82dc01352b0361d))
* Use nx release publish ([ded6561](https://github.com/lecca-digital/lecca-io/commit/ded656103a557ea2f26716b9989aecc16236e369))
* Use semantic release in toolkit yml ([5ff43d9](https://github.com/lecca-digital/lecca-io/commit/5ff43d923059466a0f4c817c71059047107c232d))

## [0.4.2](https://github.com/lecca-digital/lecca-io/compare/v0.4.1...v0.4.2) (2024-12-13)


### Bug Fixes

* Update server dockerfile to include libs ([5451a48](https://github.com/lecca-digital/lecca-io/commit/5451a4852425869dbd1466622f73815bc903dcb1))

## [0.4.1](https://github.com/lecca-digital/lecca-io/compare/v0.4.0...v0.4.1) (2024-12-13)


### Bug Fixes

* Trigger release (test) ([0289046](https://github.com/lecca-digital/lecca-io/commit/02890460ae3dbacef3add75067d35f0d8c7ff243))

# [0.4.0](https://github.com/lecca-digital/lecca-io/compare/v0.3.1...v0.4.0) (2024-12-13)


### Bug Fixes

* **server:** Update action, connection, and trigger constructor defaults ([bc1bde5](https://github.com/lecca-digital/lecca-io/commit/bc1bde5761239fe54746189bfeac67c4836064fb))


### Features

* **server:** Convert all triggers to new format ([1bb1a7c](https://github.com/lecca-digital/lecca-io/commit/1bb1a7c5b3dfb3d7da2baa0236508fbb845250f0))
* **server:** Update trigger constructor to build from js object ([fbd8fd6](https://github.com/lecca-digital/lecca-io/commit/fbd8fd6f6cc64e95cb8ff30448195aff44436b70))
* Support apps, actions, and triggers from js object (WIP) ([3c1064a](https://github.com/lecca-digital/lecca-io/commit/3c1064a2d28f8a5d4dd0ed8bb6b5d98d873568ab))
* **toolkit:** Create toolkit and apps packages (WIP) ([a5d3c65](https://github.com/lecca-digital/lecca-io/commit/a5d3c653d723db6cafd7692595331205065530fc))

## [0.3.1](https://github.com/lecca-digital/lecca-io/compare/v0.3.0...v0.3.1) (2024-12-05)


### Bug Fixes

* Point to new container registry ([c6f3024](https://github.com/lecca-digital/lecca-io/commit/c6f30246c1934ffed9d0a5d819a44886efa83001))

# [0.3.0](https://github.com/lecca-digital/lecca-io/compare/v0.2.3...v0.3.0) (2024-12-05)


### Features

* **ui:** Add conditional tracking using VITE_ENABLE_ANALYTICS env variable ([327d53b](https://github.com/lecca-digital/lecca-io/commit/327d53ba90234dfe645c1f5abbb0989c4c415e1f))

## [0.2.3](https://github.com/lecca-digital/lecca-io/compare/v0.2.2...v0.2.3) (2024-12-04)


### Bug Fixes

* Add vercel-build script to package.json ([c28e575](https://github.com/lecca-digital/lecca-io/commit/c28e5753f1a02d182dde3b40b02e4eafc352305d))

## [0.2.2](https://github.com/lecca-digital/lecca-io/compare/v0.2.1...v0.2.2) (2024-12-04)


### Bug Fixes

* Update release action ([a8f0ac6](https://github.com/lecca-digital/lecca-io/commit/a8f0ac666cb1a1eeb64ea68fdb2a0324e87223a6))

## [0.2.1](https://github.com/lecca-digital/lecca-io/compare/v0.2.0...v0.2.1) (2024-12-04)


### Bug Fixes

* **server:** Skip credit check if using custom llm connection for agent ([bfcc5d7](https://github.com/lecca-digital/lecca-io/commit/bfcc5d79074b18c83349f62d93690561d8d8ae2b))

# [0.2.0](https://github.com/lecca-digital/lecca-io/compare/v0.1.1...v0.2.0) (2024-12-04)


### Features

* **server:** Remove xml app to trigger release (testing) ([17a9020](https://github.com/lecca-digital/lecca-io/commit/17a902060fc88239e1c410fdae076620d358f3f2))
