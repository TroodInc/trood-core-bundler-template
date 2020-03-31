============
Main config
============

The main config file is ``src/config.js``

In this file you can specify the following attributes:

.. attribute:: title

    project name

.. attribute:: businessObjects

    endpoints for business objects in custodian are installed

.. attribute:: libraries

    component library directory name

.. attribute:: services

    settings for additional services

.. attribute:: layouts

    default layout settings

.. attribute:: pages

    page settings and connection of components displayed on them

.. attribute:: entityPages

    settings for entity pages and components displayed on them

**Structure example:**

.. code-block:: javascript

  export default {
    title: 'Trood-Core',
    businessObjects: [],
    libraries: [],
    services: {},
    layouts: {},
    layouts: [],
    entityPages: {},
  }

******************************
businessObjects configuration
******************************
In business objects, we pass an array of objects with settings.

In which we indicate the following attributes:


.. attribute:: name

    the name of the directory with files for working with business objects.

.. attribute:: type

    BO Service Type

.. attribute:: models

    settings for models, here we indicate an object with the name of a business object. In this object we specify endpoint and we can indicate that we do not have pagination in endpoint

**businessObjects example:**

.. code-block:: javascript

  export default {
    ...
    businessObjects: [
      {
        name: 'CoreBusinessObjects',
        type: 'CUSTODIAN',
        models: {
          client: {
            endpoint: 'client',
          },
          clientType: {
            endpoint: 'client_type',
            pagination: false,
          },
        },
      },
    ],
    ...
  }

************************
libraries configuration
************************

Here we indicate the name of the folder with the components in the component library

**libraries example:**

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

***********************
services configuration
***********************
Here we set the settings for additional services.

For example, locale settings:

**services example:**

.. code-block:: javascript

  export default {
    ...
    services: {
      locale: {
        availableLocales: [
          {
            code: 'en',
            name: 'Eng',
          },
          {
            code: 'ru',
            name: 'Рус',
          },
        ],
        defaultLocale: 'en',
      },
    },
    ...
  }

**********************
layouts configuration
**********************

Here we indicate which layout to use and if necessary, transfer the BO in the models

**layouts example:**

.. code-block:: javascript

  export default {
    ...
    layouts: {
        defaultLayout: 'TroodCoreLayout',
        models: {
            employee: 'employee',
        },
    },
    ...
  }

********************
pages configuration
********************
Pages is an array of objects describing page settings.

Each page has the following attributes:

.. attribute:: url

    **required** attribute, page url

.. attribute:: type

    **required** attribute, page layout type

.. attribute:: title

    page title, that will be shown as menu item

.. attribute:: icon

    iconType constants that will be used as TIcon.ICONS_TYPES[iconType]

.. attribute:: components

    array of page components

.. attribute:: pages

    pages.pages to render next level pages

.. attribute:: hideMenu

    hide link in the menu, only for routing

**pages example:**

.. code-block:: javascript

    export default {
      ...
      pages: [
        {
          hideMenu: true, // hide link in the menu, only for routing
          title: 'Page title', // Page title, that will be shown as menu item
          icon: 'people', // iconType constants that will be used as TIcon.ICONS_TYPES[iconType]
          url: 'url-of-the-page', // required
          type: 'grid', // required
          components: [], // array of page components
          //  pages.pages to render next level pages
          pages: [
            {
              title: 'Next page title',
              url: 'next-level-page', // so the full url will be .../url-of-the-page/next-level-page
              type: 'grid',
              components: [
                {
                  id: 'clients-header',
                  type: 'CoreComponents/ClientsHeader',
                  span: 3,
                  withMargin: true,
                  models: {
                    client: 'client',
                    employee: 'employee',
                  },
                },
              ],
            },
          ]
        }
      ]
      ...
    }

**************************
entityPages configuration
**************************

entityPages is an object that contains a description of entity objects

Each entity pages has the following attributes:

.. attribute:: url

    **required** attribute, the final url will be .../<url>/<PK>

.. attribute:: type

    **required** attribute, page layout type

.. attribute:: pages

    pages.pages to render next level pages

.. attribute:: components

    array of page components

.. attribute:: title

    page title

.. attribute:: columns

    the grid layout columns

**entityPages example:**

.. code-block:: javascript

    export default {
      ...
      entityPages: {
        // entityName as BO name
        client: {
          url: 'url-of-the-page', // required, the final url will be .../url-of-the-page/<PK>
          type: 'grid', // required
          pages: [
            {
              title: 'General', // page title
              url: 'general', // the final url will be  .../url-of-the-page/<PK>/general
              type: 'grid',
              columns: 12, // the grid layout columns
              components: [], // array of page components
            }
          ]
        }
      }
      ...
    }

********************************
pages components configuration
********************************

.. attribute:: id

    component id

.. attribute:: type

    the folder with the component in the component library

.. attribute:: span

    the grid layout span

.. attribute:: withMargin

    add margin to component or not

.. attribute:: models

    in the model we indicate with which BO the component is associated

**components array example:**

.. code-block:: javascript

    export default {
      ...
        components: [
          {
            id: 'clients-table',
            type: 'CoreComponents/ClientsTableView',
            span: 12,
            withMargin: true,
            models: {
              client: 'client',
              clientType: 'clientType',
              employee: 'employee',
            },
          },
        ],
      ...
    }
