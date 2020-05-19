================
Page components
================
.. _`redux-restify forms docs`: https://github.com/DeyLak/redux-restify/blob/master/docs/forms.md
.. _`redux-restify api docs`: https://github.com/DeyLak/redux-restify/blob/master/docs/api.md
.. _`redux-restify api selectors docs`: https://github.com/DeyLak/redux-restify/blob/master/docs/api.md#selectors
.. _`redux-restify api actions docs`: https://github.com/DeyLak/redux-restify/blob/master/docs/api.md#actions

Page components are common React components. By structure, they should be stored in the component library. For example : ``src/componentLibraries/TroodCoreComponents``

And already in ``src/componentLibraries/TroodCoreComponents`` we can create our components, for example, a client table:
``src/componentLibraries/TroodCoreComponents/ClientsTableView``

Example component structure:

* index.js  - required
* index.css
* form.js - for create page redux store
* constants.js

**************************
Page component redux form
**************************

About configuration of ``src/componentLibrary/<componentLibName>/<componentName>/form.js`` your can read in `redux-restify forms docs`_

We have props with which we can interact with forms:

* form - only if the component has form.js, contains data from redux storage
* formActions - only if the component has form.js, redux-restify actions for form.js, `redux-restify forms docs`_

**Form file description example:**

.. code-block:: javascript

  export default {
    defaults: {
      activeStatusFilter: 'ACTIVE',
      clientTypeFilterArray: [],
      search: undefined,
    },
  }


*********************
Page component props
*********************
We have props that are implicitly passed to components, but you can interact with them:

.. _qhistory: https://www.npmjs.com/package/qhistory

* history - object of qhistory_
* model - entity model, only if the component is added on entityPage
* modalsActions - actions for calling modal windows
* form - only if the component has form.js, contains data from redux storage
* formActions - only if the component has form.js, redux-restify actions for form.js, `redux-restify forms docs`_

--------

When you transfer a Business object, you will get access to its props:

* BONameEditorActions - actions for edit business object
* BONameActions - custom actions from business object (if has export default { actions } in ``<BOName>/index.js``)
* BONameComponents - constants from business object (if has exports in ``<BOName>/components/index.js``)
* BONameConstants - constants from business object (if has ``<BOName>/constants.js``)
* BONameEntities - restify api.selectors - `redux-restify api selectors docs`_
* BONameApiActions - restify api.actions - `redux-restify api actions docs`_
* childBOName - actions for working with children.
    - We can use **getChildArray()** to get an array of children associated with the current entity.
    - We can use **getChildArrayCount()** to get the number of children in the array associated with the current entity.
    - We can use **getIsLoadingChildArray()** to check if the array of children associated with the current entity is loaded.

*******************************
Page components library config
*******************************

The page components library config file is ``ssrc/componentLibraries/<PageCompLibName>/config.js``

.. attribute:: title

    Page components library name

.. attribute:: components

    .. attribute:: title

        Component name

    .. attribute:: services

        services

    .. attribute:: models

        models

For example, we describe the connection of the component ``ClientsTableView``:

.. code-block:: javascript

  export default {
    title: 'TroodCoreComponents',
    components: [
      {
        title: 'ClientsTableView',
        models: [
          {
            name: 'client', // name of business object in system
          },
          {
            name: 'clientType', // name of business object in system
          },
        ],
      },
    ],
  }

*******************************
TroodCoreComponents 
*******************************

++++++++++
TableView
++++++++++

Represents preconfigured table view for business entity passed to ``table`` model.

props:

.. attribute:: checking

Boolean. If true displays row checkboxes.

.. attribute:: editable

Boolean. If true adds column with edit icon which allow edit entity.

.. attribute:: include

Array of string. List of column names to include in table output

.. attribute:: exclude

Array of string. List of column names to exclude in table output

Simple usage in ``./src/config.js``

.. code-block:: javascript

  pages: [
    {
      title: 'Employee',
      url: 'table',
      type: 'grid',
      components: [
        {
          type: 'TroodCoreComponents/TableView',
          span: 3,
          withMargin: true,
          models: {
            table: 'employee',
          },
          props: {
            editable: true,
            checking: true,
            exclude: ['id'],
          },
        },
      ],
    },
  ],

++++++++++
InfoBlock
++++++++++

Component for outputting data from a Business object to its page.

props:

.. attribute:: title

Title for component

.. attribute:: editable

Boolean. If true adds column with edit icon which allow edit entity. Default is ``false``

.. attribute:: include

Array of strings. List of field names to include in component output.

.. attribute:: exclude

Array of strings. List of field names to exclude in component output.

If you want to edit the data, you need to specify the model object in the component configuration and transfer the
business object to the model.

``models: {model: <BOName>}``

Simple usage in ``./src/config.js``

.. code-block:: javascript

  entityPages: [
    {
      title: 'Clients',
      url: 'clients',
      type: 'grid',
      components: [
        {
          type: 'TroodCoreComponents/InfoBlock',
          span: 12,
          withMargin: true,
          models: {
            model: 'client', // name of business object in system
          },
          props: {
            title: 'Client info',
            editable: true,
            exclude: ['id'],
          },
        },
      ],
    },
  ],
