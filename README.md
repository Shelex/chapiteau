# Chapiteau

<p align="center">
  <img src="./public/logo-rounded.png" alt="Logo" width="320" height="300">
</p>

Welcome to the chapiteau :circus_tent: - a place where you will observe your playwright test results :performing_arts: with bells :bell: and whistles :tada: to please your manager :bar_chart: and your ego :chart_with_upwards_trend:!

## What is iT For?

In a nutshell it is a Next.js application with a PostgreSQL database designed to parse, store, and visualize Playwright test results in an easy-to-understand format, providing a solution for historical test reporting and analytics. It's designed to help teams visualize and analyze their test results efficiently, making it easier to track performance and identify trends over time.
Playwright html reports are already awesome, this is just a cherry on top :tada:

## Demo

There is [invite link](https://chapiteau.shelex.dev/api/teams/a6d130d8-f180-460c-ba0e-5419ddddb0cb/invite/df96f2c2-1b84-4d2e-89a1-3da0252151c1) for a demo team with some randomized data just to have an idea how it works (or not ). Only sign in via github is required.

## Getting Started

1. Sign In with GitHub:

    - Go to the Chapiteau application and sign in using your GitHub account.

2. Create a Team:

    - After signing in, create a new team to organize your projects.

3. Create a Project:

    - Within your team, create a new project where you will upload your Playwright reports.

4. Generate an API Key:

    - Navigate to the "Manage" page of your project and generate an API key. This key will be used for authentication when uploading reports.

5. Open Project Page:

    - Go to the project page to find the URL specific to your project. This url will be used to specify where to upload reports.

6. Use [chapiteau-cli](https://www.npmjs.com/package/chapiteau-cli) (just with `npx`):

    - Use the following command to upload your Playwright report:

    ```bash
        # path is report_folder - run info will be parsed from pw report html file, and report will be saved and served
        npx chapiteau-cli upload --path "./playwright-report" --url "{URL_FROM_PROJECT_PAGE}" --auth "{PROJECT_API_KEY}" --build-url "{CI_BUILD_URL_OPTIONAL}" --build-name "{CI_BUILD_NAME_OPTIONAL}"
    ```

    - Replace the placeholders with your actual values. For example:

    ```bash
        # example:
        npx chapiteau-cli upload --path "./playwright-report" --url "https://chapiteau.shelex.dev/api/teams/870ddb60-b3ac-4bea-8f83-94c2d6577650/5d2f0dcb-4c4c-49f5-b14d-28b689c5fd54" --auth "fb8c36be-5923-4bae-bcc3-3a16090c9561"
    ```

    - Upload Run Statistics ONLY (without serving report):

    - If you want to upload just the run statistics, use the following command:

    ```bash
        # path is report_folder/index.html - run info will be parsed from pw report html file
        npx chapiteau-cli upload --path "./playwright-report/index.html" --url "{URL_FROM_PROJECT_PAGE}" --auth "{PROJECT_API_KEY}" --build-url "{CI_BUILD_URL_OPTIONAL}" --build-name "{CI_BUILD_NAME_OPTIONAL}" --report-url "{LINK_TO_HOSTED_REPORT}"
    ```

    - Again, replace the placeholders with your actual values.

    ```bash
        # example:
        npx chapiteau-cli upload --path "./playwright-report/index.html" --url "https://chapiteau.shelex.dev/api/teams/870ddb60-b3ac-4bea-8f83-94c2d6577650/5d2f0dcb-4c4c-49f5-b14d-28b689c5fd54" --auth "fb8c36be-5923-4bae-bcc3-3a16090c9561" --report-url "https://shelex.github.io/pw-tests-with-gh-pages/5"
    ```

-   let the clowns :juggling_person: and acrobats :cartwheeling: do the damn job under the hood

## How to invite team members

1. Open the Team Management Page:
    - Navigate to the "Manage" section for the specific team you want to invite members to.
2. Select the "Invites" Tab:
    - Click on the "Invites" tab to access the invitation options.
3. Add Team Members:
    - Click the "Add" button.
    - Specify the number of members you wish to invite and set the expiration time for the invitation link (e.g., 24 hours, 7 days).
4. Share the Invitation Link:
    - Once you have configured the invitation settings, copy the generated link.
    - Share this link with your team members via email, chat, or any preferred communication method.
5. Team Members Accept the Invitation:
    - Instruct your team members to click the link and sign in to join the team.

## Features

-   <strong>Easy Integration</strong> - A single dependency required—an npm library to upload index.html from your Playwright report and send results to the
    backend.
-   <strong>Robust Backend</strong> - Tracks test runs for specific projects, serves reports, has simple authentication via GitHub.
-   <strong>User-Friendly UI</strong> - Offers a graphical interface with visualizations, trends, and direct links to Playwright reports.
-   <strong>Team Collaboration</strong> - Easily invite team members to collaborate on projects and share test results.

## Roadmap

-   TODO: <strong>File Statistics Page</strong> - View statistics for individual files.
-   TODO: <strong>Test Statistics Page</strong> - Analyze performance metrics for specific tests.
-   TODO: <strong>Self-Hosting Instructions</strong> - Guidance on deploying Chapiteau using Docker Compose, Docker and potentially cloud providers.
-   TODO: <strong>Time Filters</strong> - Apply filters for trend graphs and pagination for better data management.
-   TODO: <strong>Historical Comparison</strong> - Compare test results over time and link to historical reports.
-   TODO: <strong>Log History</strong> - A page with events that happened in system to identify the cause of something happening.
-   TODO: <strong>Customizable Authorization</strong> - Provide a way to specify what kind of auth provider should be used.

## Support

If you encounter any issues or have questions, please file an issue on the [GitHub issue tracker](https://github.com/Shelex/chapiteau/issues).

## License

Copyright 2024 Oleksandr Shevtsov ovr.shevtsov@gmail.com
This project is licensed under the [Apache 2.0 License](LICENSE).
