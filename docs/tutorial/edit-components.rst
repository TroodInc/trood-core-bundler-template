================================
Create and edit data
================================
.. _`redux-restify forms docs`: https://github.com/DeyLak/redux-restify/blob/master/docs/forms.md
.. _`redux-restify api docs`: https://github.com/DeyLak/redux-restify/blob/master/docs/api.md
.. _`manual-configuration-bo`: http://docs.dev.trood.ru/troodsdk/front/tutorial/config.html#manual-configuration-bo

************************
EditComponent
************************

In order to create or edit data, in the ``/src/businessObjects/<BOLibName>/<BOName>/editComponent.js`` file we need to describe the form to fill in the data in the standard React component EditComponent.

-----

EditComponent props:
*********************

* isEditing - true - editing mode, false - create mode
* parents - info about parent forms
* model - redux store values for current form
* modelErrors - errors for current form by fields
* modelValid - valid form or not
* modelActions - custom actions for current BO
* modelApiActions - `redux-restify api docs`_
* modelFormActions - `redux-restify forms docs`_
* serverModel - redux store values for current entity (before changes)
* authData - account information

**BO dependent props:**

* child<BOName> - child BO entities
* <BOName>Entities - BO entity
* <BOName>EditorActions - BO Editor actions
* <BOName>ApiActions - BO Api actions

more details can be found here `manual-configuration-bo`_

-----

Styles for the component can be described in the file: ``/src/businessObjects/<BOLibName>/<BOName>/editComponent.css``

*****************************
How to call the editComponent
*****************************

Each business object has actions for editing, you can call it out with the help of ``<BOName>EitorActions.editEntity()``

With this call, a modal window opens with the component described in the file ``/src/businessObjects/<BOLibName>/<BOName>/editComponent.js``

<BOName>EditorActions.editEntity(model, formConfig)

.. attribute:: model

  BO entity - it is specified for editing. For created - pass *undefined*.

.. attribute:: formConfig

  additional form restify configuration that can override the standard form.js parameters for <BOName>

  More about form config: `redux-restify forms docs`_

****************************************************
How to call and add to the inlineEditComponent page
****************************************************

You can change data not through a modal window, but in line in the component itself

For inline render editComponent we need ``import { InlineEntityEditor } from '$trood/entityManager'``

And when listing, pass the elements to the InlineEntityEditor

.. code-block:: javascript

  clientsArray.map(client => {
    <InlineEntityEditor {...{
      key: client.id, // set key
      model: client, // model data
      modelType: 'client', // BOName
    }} />
  })

--------

To call the inline editing form, we need to call the action ``<BOName>EitorActions.editInlineEntity()``

editInlineEntity has same arguments ``model``, ``formConfig``

--------

``editEntity`` and ``editInlineEntity``, maybe with the child prefix ``editChildEntity`` and ``editInlineChildEntity``, they can be called within the ``entityPage`` or ``editComponent``.

Moreover, this form will be associated with the instance of the BO for which ``entityPage`` or ``editComponent`` is generated.

And also at the time of submission, the BO field that is the link will be automatically set to this instance, if the field value is still undefined

