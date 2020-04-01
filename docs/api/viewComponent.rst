===============
View component
===============

.. _`redux-restify forms docs`: https://github.com/DeyLak/redux-restify/blob/master/docs/forms.md
.. _`redux-restify api docs`: https://github.com/DeyLak/redux-restify/blob/master/docs/api.md
.. _`redux-restify api selectors docs`: https://github.com/DeyLak/redux-restify/blob/master/docs/api.md#selectors
.. _`redux-restify api actions docs`: https://github.com/DeyLak/redux-restify/blob/master/docs/api.md#actions

To create a view modal of an entity, you should create a corresponding file in ``/src/businessObject/[businessObjectsDirectoryName]/[BO Name]/viewComponent.js``.

JS file should export default react component, example:

.. code-block:: javascript

    class ViewComponent extends PureComponent {
      ...
    }

    export default ViewComponent


*********************
View component props
*********************

In a file ``/src/businessObject/[businessObjectsDirectoryName]/config.js`` you should describe an entity config, which affects on what props will be passed into a ``viewComponents.js``.

For example:

.. code-block:: javascript

    export default {
      title: 'businessObjectsDirectoryName',
      models: [
        {
          title: 'clients', // BO name
          dependsOn: [ // list of other BO, which actions you want to use
            'BOName',
          ],
          viewModal: {
            size: 'medium', // modal window size, could be one of [full, large, medium, small, confirm, confirmMedium]
          },
        },
        ...
      ]
    }

We have props that are implicitly passed to components, but you can interact with them:

.. _qhistory: https://www.npmjs.com/package/qhistory

* model - entity model object
* modelActions  - current entity custom actions from business object (if has export default { actions } in <BOName>/index.js)
* modelApiActions - entity restify api.actions - `redux-restify api actions docs`_

-------------

* show - boolean flag of modal show state
* isEditing - boolean flag of modal editing state
* shouldCloseOnOverlayClick - boolean flag of modal closing on click outside
* dataCyName - viewComponent name for tests

-------------

* modelFormName - name of the current model form
* modelErrors - errors of the current model form
* modelValid - boolean flag of current model form validation
* modelFormActions - an actions on the current model form

-------------

* entityId - entity id on Redux Store
* parents - parent entity data from page or modal of what this viewModal was called
* title - modal window title
* closeAction - an action to close modal
* size - // modal window size, could be one of [full, large, medium, small, confirm, confirmMedium]
* serverModel - same as model, here for keep consistance with editComponent
* authData - current logined user data, sush as login, token, abac rules obj, etc.
* deleteAction - an action to delete current viewing object
* editAction - an action to call editComponent for current viewing object
* cancelAction - an action to cancel current viewModal (for example if this modal was opened from another)

-------------

* BONameEditorActions - actions for edit business object
* BONameActions - custom actions from business object (if has export default { actions } in <BOName>/index.js)
* BONameComponents - components from business object (if has export * as components in <BOName>/index.js)
* BONameConstants - constants from business object (if has export * as constants in <BOName>/index.js)
* BONameEntities - restify api.selectors - `redux-restify api selectors docs`_
* BONameApiActions - restify api.actions - `redux-restify api actions docs`_
* childBOName - actions for working with child

***********************
View component actions
***********************

To open BO modal view you should call a corresponding action. For example:


.. code-block:: javascript

  // some layouts
  <div {...{
    className: style.button,
    onClick: () => matterEditorActions.viewEntity(matter, {
      history,
    }),
  }}>
    some text
  </div>


So, the boNameEditorActions method viewEntity accepts two arguments:

1. An object or an id of the BO that modal you want to open
2. Configuration object with keys

.. code-block:: javascript

  {
    history, // react router history object
    title, // title string
    closeOnEdit, // boolean
  }
