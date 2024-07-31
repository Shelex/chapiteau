# Chapiteau

<p align="center">
  <img src="./public/logo.png" alt="Logo" width="250" height="250" style="border-radius: 50%; background: white; padding: 20px;">
</p>

Welcome to the chapiteau - a place where you will observe your playwright test results with blows and whistles to please your manager!

## Demo

There is [invite link](https://chapiteau.shelex.dev/api/teams/a6d130d8-f180-460c-ba0e-5419ddddb0cb/invite/df96f2c2-1b84-4d2e-89a1-3da0252151c1) for a demo team with some randomized data just to have an idea how it works (or not ¯\_(ツ)\_/¯). Only sign in via github is required.

## Getting Started

-   Sign in with Github
-   Create a team
-   Create a project
-   Create an api key for your project (on "Manage" page)
-   Open project page
-   Grab url for specific project
-   Install [chapiteau-cli](https://www.npmjs.com/package/chapiteau-cli) (or just use with `npx`):

    -   upload and serve your report:

    ```bash
        # path is report_folder - run info will be parsed from pw report html file, and report will be saved and served
        npx chapiteau-cli upload --path "./playwright-report" --url "{URL_FROM_PROJECT_PAGE}" --auth "{PROJECT_API_KEY}" --build-url "{CI_BUILD_URL_OPTIONAL}" --build-name "{CI_BUILD_NAME_OPTIONAL}"

        # example:
        npx chapiteau-cli upload --path "./playwright-report" --url "https://chapiteau.shelex.dev/api/teams/870ddb60-b3ac-4bea-8f83-94c2d6577650/5d2f0dcb-4c4c-49f5-b14d-28b689c5fd54" --auth "fb8c36be-5923-4bae-bcc3-3a16090c9561"
    ```

    -   upload just run statistic data:

    ```bash
        # path is report_folder/index.html - run info will be parsed from pw report html file
        npx chapiteau-cli upload --path "./playwright-report/index.html" --url "{URL_FROM_PROJECT_PAGE}" --auth "{PROJECT_API_KEY}" --build-url "{CI_BUILD_URL_OPTIONAL}" --build-name "{CI_BUILD_NAME_OPTIONAL}" --report-url "{LINK_TO_HOSTED_REPORT}"

        # example:
        npx chapiteau-cli upload --path "./playwright-report/index.html" --url "https://chapiteau.shelex.dev/api/teams/870ddb60-b3ac-4bea-8f83-94c2d6577650/5d2f0dcb-4c4c-49f5-b14d-28b689c5fd54" --auth "fb8c36be-5923-4bae-bcc3-3a16090c9561" --report-url "https://shelex.github.io/pw-tests-with-gh-pages/5"
    ```

-   let the clowns and acrobats do the damn job under the hood

## How to invite team members

-   Open "manage" for specific team
-   Select "Invites" tab
-   Click "Add", specify how much members you expect and expiration time
-   Share the link with team members

## Features

-   Single dependency required - npm library to upload index.html from your playwright-report and send results to the backend
-   Backend that tracks runs for specific projects, can serve reports, simple stupid auth with github.
-   UI with graphs, trends and links to playwright report
-   TODO: files statistics page
-   TODO: tests statistics page
-   TODO: describe how to self-host (docker-compose, what is important for successful deployment)
-   TODO: time filters for trend graph and entire page, pagination
-   TODO: tests historical comparison, link to reports

## Contributing

Contributions from the community are much more than welcome!  
If you have any ideas, bug reports, or feature requests, please open an issue or submit a pull request.

## License

Copyright 2024 Oleksandr Shevtsov ovr.shevtsov@gmail.com
This project is licensed under the Apache 2.0 License.
