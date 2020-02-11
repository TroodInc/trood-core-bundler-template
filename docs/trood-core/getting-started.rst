================================
Getting Started
================================

For example, we specify the NPM commands, but you can also use Yarn

************************
Initialize a new project
************************

For init a new project, we use ``trood-core-react-scripts`` based on ``create-react-app``

For start, install trood-core-react-scripts global, run the command: ``npm i -g trood-core-react-scripts``

And initialize you project (in this step you mast have package.json file with base setup)

.. code-block:: default

    {
      "name": "trood-init",
      "version": "1.0.0",
      "dependencies": {

      }
    }


We need run the command: ``trood-core-react-scripts initApp``

After executing the command, we get a start-up project that is ready to set up

Now you have base config for you trood-core app, you can start project localy ``npm start`` or build app ``npm run build``

***********
Create .env
***********

After initializing the project, we need to create the ``.env`` file in the root directory of the project. The default file can be found on the path ``etc/.env.def``

In this file we need to leave only those services that we will use in the project, in the future they can be added.
And register the URL to the servers of these services and indicate the version of the core

**For example:**

.. code-block:: default

    REACT_APP_DEFAULT_API_HOST=http://demo.trood.com/custodian/data/
    REACT_APP_AUTH_API_HOST=http://demo.trood.com
    REACT_APP_FILE_API_HOST=http://demo.trood.com
    REACT_APP_MAIL_API_HOST=http://demo.trood.com
    REACT_APP_SEARCH_API_HOST=http://demo.trood.com
    REACT_APP_JOURNAL_API_HOST=http://demo.trood.com
    REACT_APP_TROOD_AGENTS_API_HOST=http://demo.trood.com
    REACT_APP_REPORTING_API_HOST=http://demo.trood.com/reporting/v1/
    REACT_APP_REPORTING_PREPARED_ENDPOINT=reports/
    REACT_APP_REPORTING_CONFIG_ENDPOINT=connections/\$connectionCode/report/

The default version is ``TROOD_CORE_VERSION=master``. But you can change it by specifying it yourself. This can be a branch name, tag, or commit in the repository. **For example:** ``TROOD_CORE_VERSION=dev``

The default port is 3333. But you can change it by setting ``PORT=3005``

*************************
Default project structure
*************************

.. code-block:: default

    ect/
    	.env.def
    public/
    src/
    	businessObjects/
    	componentLibraries/
    	layouts/
    	config.js
    	customApiConfig.js
    translate/
    	po/
    .babelrc
    .eslintignore
    .eslintrc.js
    .gitignore
    package.json
    package-lock.json
    stylelint.config.js
