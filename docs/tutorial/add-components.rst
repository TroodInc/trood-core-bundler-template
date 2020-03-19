================================
Add page component
================================
.. _`redux-restify forms docs`: https://github.com/DeyLak/redux-restify/blob/master/docs/forms.md

****************************************
How and where to create a page component
****************************************
First, in the ``src\config.js`` config, declare the name of the folder in which our components will be
To do this, add the libraries parameter and specify the name of the folder in the object, for example, "TroodCoreComponents"

.. code-block:: javascript

  export default {
    ...
    libraries: [
      {
        name: 'TroodCoreComponents',
      },
    ],
    ...
  }

Next, in the component library folder, create our declared folder ``src/componentLibraries/TroodCoreComponents``

And already in ``src/componentLibraries/TroodCoreComponents`` we can create our components, for example, a client table:
``src/componentLibraries/TroodCoreComponents/ClientsTableView``

Example component structure:

* index.js  - required
* index.css
* form.js - for create page redux store
* constants.js

--------

About configuration of ``src/componentLibrary/<componentLibName>/<componentName>/form.js`` your can read in `redux-restify forms docs`_

--------

Add a component to "componentLibrary/../config.js"

In order to transfer data from the back-end to the component, we need to connect them in the config, describing the component and the connected models

For example, we describe the connection of the component "ClientsTableView":

.. code-block:: javascript

  export default {
    title: 'TroodCoreComponents',
    components: [
      {
        title: 'ClientsTableView',
        models: [
          {
            name: 'client',
          },
          {
            name: 'clientType',
          },
        ],
      },
    ],
  }

******************************************************
How to add a component to a page
******************************************************
Now, we should only edit your system configuration in ``src/config.js`` file

To display the component on the page, we set the config for the page. For example, consider the Clients page:

.. code-block:: javascript

    export default {
      ...
      pages: [
        {
          hideMenu: true, // hide link in the menu, only for routing
          title: 'Page title, that will be shown as menu item',
          icon: 'iconType constants that will be used as TIcon.ICONS_TYPES[iconType]',
          url: 'url-of-the-page', // required
          type: 'grid', // required
          components: [ // array of page components
            {
              id: 'clients-table', // id - unique, required Component id (For rendering optimisations, EM can figure it out automatically)
              type: 'TroodCoreBusinessComponents/ClientTableView', // type - required Component type from library
              span: 3, // Grid span for component (How many columns component gets)
              withMargin: true, // Enable/disable render marging (for creating card-like components on a page)
              models: { // Business objects mapping
                activeStatus: 'activeStatus', // Component model and corresponding business object
                clients: 'clients', // Component model and corresponding business object
              },
            },
          ],
        }
      ]
      ...
    }

We can also add a component to entity pages. To do this, we set these settings in the config:

.. code-block:: javascript

    export default {
      ...
      entityPages: [
        client: { // System pages register
          title: 'Clients', // Page title
          url: 'clients', // Page url
          type: 'grid', // Page type (Can be: personalAccount, mail or grid)
            components: [
              {
                id: 'clients-table', // id - unique, required Component id (For rendering optimisations, EM can figure it out automatically)
                type: 'TroodCoreBusinessComponents/ClientTableView', // type - required Component type from library
                span: 3, // Grid span for component (How many columns component gets)
                withMargin: true, // Enable/disable render marging (for creating card-like components on a page)
                models: { // Business objects mapping
                  activeStatus: 'activeStatus', // Component model and corresponding business object
                  clients: 'clients', // Component model and corresponding business object
                },
              },
            ],
        },
      ],
    }

You can transfer your additional custom props:

.. code-block:: javascript

  components: [
    {
      id: 'clients-table', // id - unique, required Component id (For rendering optimisations, EM can figure it out automatically)
      type: 'TroodCoreBusinessComponents/ClientTableView', // type - required Component type from library
      span: 3, // Grid span for component (How many columns component gets)
      withMargin: true, // Enable/disable render marging (for creating card-like components on a page)
      models: { // Business objects mapping
        activeStatus: 'activeStatus', // Component model and corresponding business object
        clients: 'clients', // Component model and corresponding business object
      },
      props: { // custom props
        color: 'red',
        hideButton: true,
        pageSize: 30,
      },
    },
  ],


--------

We have props that are implicitly passed to components, but you can interact with them:

.. _qhistory: https://www.npmjs.com/package/qhistory

* history - object of qhistory_
* model - entity model, only if the component is added on entityPage
* modelActions  - actions for model, only if the component is added on entityPage
* modalsActions - actions for calling modal windows
* form - only if the component has form.js, contains data from redux storage
* formActions - only if the component has form.js, redux-restify actions for form.js, `redux-restify forms docs`_

--------

When you transfer a Business object, you will get access to its props:

* BOName
* BONameEditorActions
* BONameActions
* BONameComponents
* BONameConstants
* BONameEntities
* BONameApiActions
* childBOName
