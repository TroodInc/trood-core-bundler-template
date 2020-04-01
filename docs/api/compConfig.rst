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
* BONameActions - custom actions from business object (if has export default { actions } in <BOName>/index.js)
* BONameComponents - constants from business object (if has exports in <BOName>/components/index.js)
* BONameConstants - constants from business object (if has <BOName>/constants.js)
* BONameEntities - restify api.selectors - `redux-restify api selectors docs`_
* BONameApiActions - restify api.actions - `redux-restify api actions docs`_
* childBOName - actions for working with child

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

For example, we describe the connection of the component "ClientsTableView":

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
