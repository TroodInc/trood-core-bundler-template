================================
Create and edit data
================================

In order to create or edit data, in the ``/src/businessObjects/<BOLibName>/<BOName>/editComponent.js`` file we need to describe the form to fill in the data in the standard React component EditComponent.

Styles for the component can be described in the file: ``/src/businessObjects/<BOLibName>/<BOName>/editComponent.css``

*****************************
How to call the editComponent
*****************************

Each business object has actions for editing, you can call it out with the help of ``<BOName>EitorActions.editEntity()``

With this call, a modal window opens with the component described in the file ``/src/businessObjects/<BOLibName>/<BOName>/editComponent.js``

In editEntity you can pass a value or set default values

.. code-block:: javascript

  <BOName>EditorActions.editEntity(undefined, {
    defaults: {
      author: 'Trood',
      name: 'BO Client',
    },
    value: {
      max: 10,
      main: 5,
    },
  })

****************************************************
How to call and add to the inlineEditComponent page
****************************************************

You can change data not through a modal window, but in line in the component itself

For inline output edit we need to import ``import { InlineEntityEditor } from '$trood/entityManager'``

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

To call the inline editing form, we need to call the action ``<BOName>EitorActions.editInlineChildEntity()``

In editInlineChildEntity you can pass a value or set default values

.. code-block:: javascript

  <BOName>EditorActions.editInlineChildEntity(undefined, {
    defaults: {
      author: 'Trood',
      name: 'BO Client',
    },
    value: {
      max: 10,
      main: 5,
    },
  })
