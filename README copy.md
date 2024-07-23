# Chapiteau

<img src="./public/logo.jpg" width="250" height="250">

Welcome to the chapiteau - a place where you will observe your playwright test results with blows and whistles to please your manager!

## Getting Started

- Sign in with Github
- Create a team
- Create a project
- Create an api key for your project
- Open project page
- Grab url for specific project
- Install `chapiteau-cli`
    - to upload just run data:
    ```bash
        # path is report_folder/index.html - run info will be parsed from pw report html file
        npx chapiteau-cli upload --path "./playwright-report/index.html" --url "{URL_FROM_PROJECT_PAGE}" --auth "{PROJECT_API_KEY}" --build-url "{CI_BUILD_URL_OPTIONAL}" --build-name "{CI_BUILD_NAME_OPTIONAL}" --report-url "{LINK_TO_HOSTED_REPORT}"
    ```
    - to upload and serve your report:
    ```bash
        # path is report_folder - run info will be parsed from pw report html file, and report will be saved and served
        npx chapiteau-cli upload --path "./playwright-report" --url "{URL_FROM_PROJECT_PAGE}" --auth "{PROJECT_API_KEY}" --build-url "{CI_BUILD_URL_OPTIONAL}" --build-name "{CI_BUILD_NAME_OPTIONAL}"
    ```
- let the clowns and acrobats do the damn job under the hood

## Features

- Single dependency required - npm library to upload index.html from your playwright-report and send results to the backend
- Backend that tracks runs for specific projects, can serve reports, simple stupid auth with github.
- TODO: UI with graphs and trends that can redirect to specific place in the hosted playwright report elsewhere

## Contributing

We welcome contributions from the community! If you have any ideas, bug reports, or feature requests, please open an issue or submit a pull request.

## License
 
This service is licensed under the [GLWTS](LICENSE) (Good Luck With That Shit) Public License. Good luck with that shit.
