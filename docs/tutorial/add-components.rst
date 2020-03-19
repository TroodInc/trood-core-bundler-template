================================
Add Component
================================
You can easily and easily add your components.

.. _`redux-restify forms docs`: https://github.com/DeyLak/redux-restify/blob/master/docs/forms.md

****************************************
How and where to create a page component
****************************************
First, in the ``src\config.js`` config, declare the name of the folder in which our components will be
To do this, add the libraries parameter and specify the name of the folder in the object, for example, "TroodCoreComponents"

.. code-block:: javascript

  libraries: [
    {
      name: 'TroodCoreComponents',
    },
  ],

Next, in the component library folder, create our declared folder ``src/componentLibraries/TroodCoreComponents``

And already in ``src/componentLibraries/TroodCoreComponents`` we can create our components, for example, a client table:
``src/componentLibraries/TroodCoreComponents/ClientsTableView``

Expected component structure:

* index.js
* index.css
* form.js
* constants.js

--------

About change config in ``src/componentLibrary/<componentLibName>/<componentName>/form.js`` your can read in `redux-restify forms docs`_

--------

***********************************************************
How to add a component to "componentLibrary/../config.js"
***********************************************************
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
Which gives a description of models, services
******************************************************
Describing the model, we customize the relationship between Back End Business Objects and our component

We can also connect different services for working with them. For example, it could be ``fileService``, ``searchService``

.. code-block:: javascript

  export default {
    title: 'TroodCoreComponents',
    components: [
      {
        title: 'ClientsTableView',
        services: ['fileService', 'searchService'],
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
      pages: [ // System pages register
        {
          title: 'Clients', // Page title
          icon: 'contactBook', // Page icon
          url: 'clients', // Page url
          type: 'grid', // Page type (Can be: personalAccount, mail or grid)
            components: [
              {
                id: 'clients-table', // Component id (For rendering optimisations, EM can figure it out automatically)
                type: 'TroodCoreBusinessComponents/ClientTableView', // Component type from library
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

We can also add a component to entity pages. To do this, we set these settings in the config:

.. code-block:: javascript

    export default {
      entityPages: [
        client: { // System pages register
          title: 'Clients', // Page title
          url: 'clients', // Page url
          type: 'grid', // Page type (Can be: personalAccount, mail or grid)
            components: [
              {
                id: 'clients-table', // Component id (For rendering optimisations, EM can figure it out automatically)
                type: 'TroodCoreBusinessComponents/ClientTableView', // Component type from library
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

******************************************************
Manual configuration
******************************************************
You can transfer your additional custom props:

.. code-block:: javascript

  components: [
    {
      id: 'clients-table', // Component id (For rendering optimisations, EM can figure it out automatically)
      type: 'TroodCoreBusinessComponents/ClientTableView', // Component type from library
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

* history
* model
* modalsActions
* form
* formActions
* pageParams
* PageChildContainer

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

--------
