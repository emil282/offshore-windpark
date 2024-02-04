<div align="center">
  <a href="https://github.com/Laxeros07/Bachelor-thesis-windpark-simulator">
    <img src="https://github.com/Bachelor-thesis-windpark-simulator/windpark-simulator/assets/90246149/8c0fff9d-1a0d-43ba-acf3-c83c59f8fb92"" alt="Logo" width="20%" height="20%">
  </a>
<h3 align="center">windscope</h3> 
 A windpark planning simulator!
  <p align="center">
        <br />
   made <a href="https://www.uni-muenster.de/Geoinformatics/">@ifgi - UNI MUENSTER</a> 🌍
    <br />
    <a href="https://github.com/Laxeros07/Bachelor-thesis-windpark-simulator"><strong>Explore the docs »</strong></a>
  </p>
</div>
<p align="center">
-- ☁️ ✇ - ✇ - ✇ ☁️ --
</p>
<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>


## Website

The website allows users to arrange a 16x16 grid with certain areas. These areas include green spaces as water areas and parks, infrastructure as roads and residentials and windturbines of two different sizes. The initial layout is all parks as you can see in the following image:
<img width="1145" alt="Bildschirmfoto 2023-08-12 um 19 41 54" src="https://github.com/ifgiscope/wind-turbines/assets/61976072/7bf2aa67-74f1-4ab0-b20c-b83af037b83d">

With the buttons on the right the user can select an area type and then change tiles by clicking on them. Right to the grid are smileys that display how satisfied certain conditions are, the amount of green spaces, the amount of wind turbines and the distances towards one another.
![image](https://github.com/ifgiscope/wind-turbines/assets/46593824/a94634a1-71ac-4406-a474-74ff8e88c408)

Below the smileys are acteurs displayed, that tell, when some conditions are true. They tell the user what is missing in the current layout. On example for this are citizens that say there is not enoug elecrticity. Therefore, there needs to be build more wind turbines.
![image](https://github.com/ifgiscope/wind-turbines/assets/46593824/6039f364-5388-416a-9d72-7594a5a0a240)

Together with all these options, the user has the goal, to build the best possible layout to fulfill all goals and leave averyone involved satisfied.

## Compilation

To install the required dependencies run `npm install` in **both** the root directory and the
`server` directory.

You can use `npm run build` or `npm run watch` in the root directory to build the client apps. The
server does not require compilation.

The `.env` file in the root directory contains settings that are applied at compilation time.

## Running

Start the server by running `npm run start` in the `server` directory.

Start the frontend by running `http-server -c-1` in the root directory.
The clients, in the root directory, are:

- `city.html`: Presents the city map, to be projected over the exhibition table.
- `dashboard.html`: Shows the auxiliary touchscreen dashboard that displays variables and goals,
  and allows selecting Power-Ups.
- `editor.html`: An editor that pushes changes to the server. Note that it doesn't read updates from
  the server, so it's not possible to use multiple editors simulatenously. It's only meant for
  use during development.

- `index.html`: This is a standalone browser version of the software.

## Configuration

The main configuration file is `config.yml`. The server has to be reloaded after any changes.
Clients get the configuration from the server through the http API and have to be reloaded after
the server to take any changes.

The .env file has other configuration keys that affect the environment.

## Server APIs

The server has both an HTTP and a WebSocket API. Their specifications are:

- http: `specs/openapi.yaml`
- ws: `specs/asyncapi.yaml`

You can use [Swagger Editor](https://editor.swagger.io/) and the
[AsyncAPI Playground](https://playground.asyncapi.io/) to format the respective specifications in
a friendly format.

## References

Some icons are used from [Flaticon](<[url](https://www.flaticon.com/)>).

## License

Copyright (c) 2021 IMAGINARY gGmbH
Licensed under the MIT license (see LICENSE)
Supported by Futurium gGmbH



<!-- ABOUT THE PROJECT -->
## About The Project
A collaborative and interactive wind farm simulator. This project was done during the summer semester 2023 at ifgi.

This project is based on the existing [future mobility project from Imaginary ](<[url](https://github.com/IMAGINARY/future-mobility)>) and adapted it towards the aim of this project.
It consists of multiple components, which will be explained in the following.
[![Product Name Screen Shot][product-screenshot]](https://example.com)

Here's a blank template to get started: To avoid retyping too much info. Do a search and replace with your text editor for the following: `Lorano and Laxeros07`, `windpark-simulator`, `twitter_handle`, `linkedin_username`, `email_client`, `email`, `project_title`, `project_description`

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![Vue][Vue.js]][Vue-url]
* [![Angular][Angular.io]][Angular-url]
* [![Svelte][Svelte.dev]][Svelte-url]
* [![Laravel][Laravel.com]][Laravel-url]
* [![Bootstrap][Bootstrap.com]][Bootstrap-url]
* [![JQuery][JQuery.com]][JQuery-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Get a free API Key at [https://example.com](https://example.com)
2. Clone the repo
   ```sh
   git clone https://github.com/Lorano and Laxeros07/windpark-simulator.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your API in `config.js`
   ```js
   const API_KEY = 'ENTER YOUR API';
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3
    - [ ] Nested Feature

See the [open issues](https://github.com/Lorano and Laxeros07/windpark-simulator/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Your Name - [@twitter_handle](https://twitter.com/twitter_handle) - email@email_client.com

Project Link: [https://github.com/Lorano and Laxeros07/windpark-simulator](https://github.com/Lorano and Laxeros07/windpark-simulator)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* []()
* []()
* []()

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/Lorano and Laxeros07/windpark-simulator.svg?style=for-the-badge
[contributors-url]: https://github.com/Lorano and Laxeros07/windpark-simulator/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Lorano and Laxeros07/windpark-simulator.svg?style=for-the-badge
[forks-url]: https://github.com/Lorano and Laxeros07/windpark-simulator/network/members
[stars-shield]: https://img.shields.io/github/stars/Lorano and Laxeros07/windpark-simulator.svg?style=for-the-badge
[stars-url]: https://github.com/Lorano and Laxeros07/windpark-simulator/stargazers
[issues-shield]: https://img.shields.io/github/issues/Lorano and Laxeros07/windpark-simulator.svg?style=for-the-badge
[issues-url]: https://github.com/Lorano and Laxeros07/windpark-simulator/issues
[license-shield]: https://img.shields.io/github/license/Lorano and Laxeros07/windpark-simulator.svg?style=for-the-badge
[license-url]: https://github.com/Lorano and Laxeros07/windpark-simulator/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com

