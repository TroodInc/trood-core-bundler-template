================================
Configuring the front-end
================================
Now, we should only edit our system configuration in ``src/config.js`` file:

.. code-block:: default

    export default {
      title: 'MyProject', // Project title
      businessObjects: [ // Business objects libraries register
        {
          name: 'TroodCoreBusinessObjects', // Library name
          type: 'CUSTODIAN', // Api type (Now only CUSTODIAN supported)
          models: { // Models endpoints configs
            activeStatus: { // Model name
              endpoint: 'active_status', // Endpoint
              pagination: false, // Pagination config
            },
          },
        },
      ],
      services: { // Services configuration (Now onlu auth service supported)
        auth: { // Service name
          profile: 'employee', // Auth service can be linked to some business object for storing additional user params
        },
      },
      libraries: [ // Components libraries register
        {
          name: 'TroodCoreBusinessComponents', // Library name
        },
      ],
      layouts: { // Custome layouts
        defaultLayout: 'TroodCoreLayout',
        models: { // Business objects mapping
            activeStatus: 'activeStatus', // Component model and corresponding business object
        },
      },
      pages: [ // Syste pages register
        {
          title: 'Контрагенты', // Page title
          icon: 'contactBook', // Page icon
          url: 'contractors', // Page url
          type: 'grid', // Page type (Can be: personalAccount, mail or grid)
          components: [], // Page components
          pages: [ // Page nested urls(second-level menus), config is the same
            {
              title: 'Лиды',
              url: 'leads',
              type: 'grid',
              components: [
                {
                  id: 'leads-table', // Component id (For rendering optimisations, EM can figure it out automatically)
                  type: 'TroodCoreBusinessComponents/LeadTableView', // Component type from library
                  span: 3, // Grid span for component (How many columns component gets)
                  withMargin: true, // Enable/disable render marging (for creating card-like components on a page)
                  models: { // Business objects mapping
                    activeStatus: 'activeStatus', // Component model and corresponding business object
                  },
                },
              ],
            },
          ],
        },
      ],
      entityPages: { // Entity pages have same configs, as system pages, but used for displaying a business object by id
        employee: { // Business object name
          // Page config goes here
        },
      },
    }
