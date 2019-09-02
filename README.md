
# **InstaDApp-Dashboard**

> ### This codebase explains how to interact with InstaDApp Smart Contracts.


This codebase was created to demonstrate InstaDApp-Dashboard built with Angular that interacts with InstaDApp [Smart Contracts]([https://github.com/InstaDApp/contract-v2](https://github.com/InstaDApp/contract-v2))


# Getting started

Make sure you have the [Angular CLI](https://github.com/angular/angular-cli#installation) installed globally. We use [Yarn](https://yarnpkg.com) to manage the dependencies, so we strongly recommend you to use it. you can install it from [Here](https://yarnpkg.com/en/docs/install), then run `yarn install` to resolve all dependencies (might take a minute).

### Clone the repo

```shell
git clone https://github.com/InstaDApp/InstaDApp-Dashboard
cd InstaDApp-Dashboard
```

### Install npm packages

Install the `npm` packages described in the `package.json` and verify that it works:

```shell
npm install
```
### For dev server

```shell
ng serve --proxy-config ./proxy.config.json
```
After running `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Building the project
```shell
ng build
```

After running `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build. These files are available in `gh-pages` branch. Use these files to run this application on your local system without any extra dependencies.


### Deploying into GitHub

Install `angular-cli-ghpages` and follow the steps in documentation of this repo.

[You can install and read steps from here]( [https://github.com/angular-schule/angular-cli-ghpages](https://github.com/angular-schule/angular-cli-ghpages))

## Functionality overview


**General functionality:**

- Interact with InstaDApp Smart Contract of MakerDao and Compound Finance.
- Exit from InstaDApp Ecosystem

**The general page breakdown looks like this:**

- Dashboard page (URL: #/dashboard )
    - Supply, Borrow, Withdraw, Payback features of Compound Finance.
    - Open / Close MakerDao CDP and use basic features of MakerDao
-  Exit page (URL: #/exit )
    -  Withdraw funds from InstaDapp account
    -  Move your CDP to your wallet account

<br />

[![Brought to you by InstaDApp](https://instadapp.io/newsletter/img/logotext.png)](https://instadapp.io)
