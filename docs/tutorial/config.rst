================================
Configuring the front-end
================================

For example, we specify the NPM commands, but you can also use Yarn

*********************************
Install trood-core-react-scripts
*********************************

For init a new project, we use ``trood-core-react-scripts`` based on ``create-react-app``

For start, install trood-core-react-scripts global, run the command: ``npm i -g trood-core-react-scripts``

************************************
Create package.json and run initApp
************************************

Initialize you project (in this step you mast have package.json file with base setup)

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

************************
Create business objects
************************

About create business objects, you can read on this page
http://docs.dev.trood.ru/troodcore/custodian/index.html

************************
Automatic configuration of BO from meta Custodian
************************

************************
Manual configuration of BO
************************

************************
Which gives a description of dependsOn, services in "businessObjects/../config.js"
************************

************************
build | start
************************
