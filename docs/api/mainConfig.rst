============
Main config
============

The main config file is ``src/config.js``

In this file you can specify the following attributes:

.. attribute:: title

    project name

.. attribute:: businessObjects

    array of business object libraries. More: `businessObjects configuration`_

.. attribute:: libraries

    array of component libraries. More: `libraries configuration`_

.. attribute:: services

    dictionary of services configuration. More: `services configuration`_

.. attribute:: layouts

    layout settings. More: `layouts configuration`_

.. attribute:: pages

    page settings and connection of components displayed on them. More: `pages configuration`_

.. attribute:: entityPages

    settings for entity pages and components displayed on them. More: `entityPages configuration`_

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

    the name of the library for working with a business object.

.. attribute:: type

    BO Service Type

.. attribute:: models

    settings for business object models

    .. attribute:: models.BOName

        here we indicate an object with the name of a business object. In this object we specify endpoint and we can indicate that we do not have pagination in endpoint

        .. attribute:: BOName.endpoint

            **required** endpoint for a business object

        .. attribute:: BOName.pagination

            whether pagination is enabled or not, by default **true**

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

Here we specify an array of libraries, and pass there an object with the name of the library in which our components will be.

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

**We have the following services for configuration:**

* **auth** - authorization service
* **locale** - localization service

**services example:**

.. code-block:: javascript

  export default {
    ...
    services: {
      auth: {
        profile: 'employee',
      },
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

.. attribute:: defaultLayout

    default layout name

.. attribute:: models

    an object to which we transfer the business objects we need

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

    array of page components, more `components configuration`_

.. attribute:: pages

    pages to render next level pages

.. attribute:: hideMenu

    hide link in the menu, page remains in routing

**pages example:**

.. code-block:: javascript

    export default {
      ...
      pages: [
        {
          hideMenu: true,
          title: 'Page title',
          icon: 'people',
          url: 'url-of-the-page',
          type: 'grid',
          components: [],
          pages: [
            {
              title: 'Next page title',
              url: 'next-level-page',
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

.. attribute:: BOName

    | the object key corresponds to the name of the Business object.
    | And each object contains the following attributes: url, type, pages, components, title, columns - is same as `pages configuration`_

**entityPages example:**

.. code-block:: javascript

    export default {
      ...
      entityPages: {
        client: {
          url: 'url-of-the-page',
          type: 'grid',
          pages: [
            {
              title: 'General',
              url: 'general',
              type: 'grid',
              columns: 12,
              components: [],
            }
          ]
        }
      }
      ...
    }

.. _`components configuration`: `pages components configuration`_

********************************
pages components configuration
********************************

.. attribute:: id

    component id

.. attribute:: type

    type of the component in the component library

.. attribute:: span

    the grid layout span

.. attribute:: withMargin

    add margin to component or not

.. attribute:: models

    in the model we indicate with which BO the component is associated

**components array example:**

.. code-block:: javascript

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
