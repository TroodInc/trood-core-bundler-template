================================
Create pages
================================

To create a page you should add a corresponding key to the ``/src/config.js`` file.

****************************************
Simple page config
****************************************

To create a simple page, you should add this to config:

.. code-block:: javascript

    ...
    pages: [
      {
        hideMenu: true, // hide link in the menu, only for routing
        title: 'Page title, that will be shown as menu item',
        icon: 'iconType constants that will be used as TIcon.ICONS_TYPES[iconType]',
        url: 'url-of-the-page', // required
        type: 'grid', // required
        components: [], // array of page components
        //  pages.pages to render next level pages
        pages: [
          {
            title: 'Page title',
            url: 'next-level-page', // so the full url will be .../url-of-the-page/next-level-page
            type: 'grid',
            components: [], // array of page components
          },
        ]
      }
    ]
    ...

********************************************
Simple entityPage config
********************************************

To create an entity page, you should add this to config:

.. code-block:: javascript

    ...
    entityPages: {
      // entityName as BO name
      client: {
        url: 'clients', // required, the final url will be .../clients/<PK>
        type: 'grid', // required
        components: [], // array of page components
        pages: [
          {
            title: 'General', // page title
            url: 'general', // the final url will be  .../clients/<PK>/general
            type: 'grid',
            columns: 12, // the grid layout columns
            components: [], // array of page components
          }
        ]
      }
    }
