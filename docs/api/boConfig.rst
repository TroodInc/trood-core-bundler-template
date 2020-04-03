=================
Business objects
=================

Business objects are located in libraries along the way: src/businessObjects/<BOLibName>/<BOName>/

**Business object structure example:**

* index.js  - required
* model.js  - required More: `Business object model`_
* form.js - More: `Business object form`_
* actions.js - More: `Business object actions`_
* constants.js - More: `Business object constants`_
* editComponent.js - More: `Business object edit & view components`_
* index.css
* viewComponent.js - More: `Business object edit & view components`_
* viewComponent.css

in the AAA file, we import all the files or folders that are in the Business object.

And then we do the default export. Model export required

.. code-block:: javascript

  import model from './model'
  import form from './form'
  import editComponent from './editComponent'
  import viewComponent from './viewComponent'
  import * as actions from './actions'

  export * as components from './components'
  export * as constants from './constants'

  export default {
    model,
    form,
    editComponent,
    viewComponent,
    actions,
  }

**********************
Business object model
**********************

Here we specify the attributes for the model and its settings

.. attribute:: defaults

    here you can set default values and link with other business objects

.. attribute:: name

    Business objects name

.. attribute:: notEdit

    disabling editing, by default it is **false**

.. attribute:: deletion

    deletion process tincture

    .. attribute:: confirm

        show confirmation or not, by default it is **false**

    .. attribute:: message

        message in the deletion confirmation module

.. code-block:: javascript

  import { RestifyForeignKey } from 'redux-restify'

  export default {
    defaults: {
      id: undefined,
      name: undefined,
      responsible: new RestifyForeignKey('employee'),
    },
    name: 'client',
    deletion: {
      confirm: true,
      message: 'Delete it?',
    },
  }

*********************
Business object form
*********************

In form, we describe the default fields for the business object creation form

.. attribute:: defaults

    the name of the library for working with a business object.

.. attribute:: submitExclude

    an object which indicates which fields should be excluded from sending to the server

.. attribute:: mapServerDataToIds

    specify to match server data with identifiers or not

**Form file description example:**

.. code-block:: javascript

  export default {
    defaults: {
      id: undefined,
      name: undefined,
      responsible: undefined,
    },
    submitExclude: {
      existsEmployee: true,
    },
    mapServerDataToIds: true,
  }


************************
Business object actions
************************

.. _`redux-restify docs`: https://github.com/DeyLak/redux-restify/blob/master/docs/

In actions, we describe our custom actions that we will use in components for working with business objects.

We can use APIs and Forms from 'redux-restify', in more detail in `redux-restify docs`_

**************************
Business object constants
**************************

Here we indicate the constants that will be used for in the files of the business object and export them

***************************
Business object components
***************************

| Here we store files of simple react components that are used in the work of a business object.
| These components are exported and can then be used in modal windows or on pages.

***************************************
Business object edit & view components
***************************************

.. _`View component`: /troodsdk/front/api/viewComponent.html

.. _`Edit component`: /troodsdk/front/api/editComponent.html

| To view an entity in a modal window, we use the "View component", you can read in the `View component`_ section
| Styles for "View component" are written in the viewComponent.css file

| To edit a business object, we use the "Edit component", you can read in the `Edit component`_ section
| Styles for "Edit component" are written in the index.css file

************************************
Business object custom modals
************************************

.. _`redux-restify forms docs`: https://github.com/DeyLak/redux-restify/blob/master/docs/forms.md
.. _`redux-restify api docs`: https://github.com/DeyLak/redux-restify/blob/master/docs/api.md

**Custom modal file**

To create a custom modal window, we need to create a file "<modalName>.modal.js" in the modals folder

| In this file we describe the stateToProps function to which two state parameters, startProps, are passed.
| This function returns an object with parameters for the modal window.
| Here we can set the settings for the title and size modal windows.
| From state, through api `redux-restify api docs`_ we can take the Entities we need
| And also from state, through forms `redux-restify forms docs`_ we can take the model data we need (model, modelErrors, modelValid)
| Also transfer startProps there

To create a custom modal window, we need to create a file "<modalName> .modal.js" in the modals folder

Also in this file we describe dispatchToProps through which we pass actions

Next, we do the registerModal export to which we transfer: the name of the modal, stateToProps and dispatchToProps and indicate to which component it should be transferred.

.. code-block:: javascript

  import { bindActionCreators } from 'redux'
  import { registerModal, MODAL_SIZES } from '$trood/modals'
  import { api, forms } from 'redux-restify'
  import ModalAttachContactPerson from '../components/ModalAttachContactPerson' // modal component
  import {
    ATTACH_CONTACT_PERSON_MODAL, // constant with modal name
    ATTACH_CONTACT_PERSON_FORM, // form name constant
  } from '../constants'

  const stateToProps = (state, startProps) => {
    return {
      title: "Contact Person",
      size: MODAL_SIZES.small,
      ...startProps,
      contactPersonEntities: api.selectors.entityManager.contactPerson.getEntities(state),
      model: forms.selectors.getForm(ATTACH_CONTACT_PERSON_FORM)(state),
      modelErrors: forms.selectors.getErrors(ATTACH_CONTACT_PERSON_FORM)(state),
      modelValid: forms.selectors.getIsValid(ATTACH_CONTACT_PERSON_FORM)(state),
    }
  }

  const dispatchToProps = (dispatch) => ({
    dispatch,
    contactPersonApiActions: bindActionCreators(api.actions.entityManager.contactPerson, dispatch),
    formActions: bindActionCreators(forms.getFormActions(ATTACH_CONTACT_PERSON_FORM), dispatch),
    cancelAction: bindActionCreators(forms.getFormActions(ATTACH_CONTACT_PERSON_FORM).deleteForm, dispatch),
  })

  export default registerModal(ATTACH_CONTACT_PERSON_MODAL, stateToProps, dispatchToProps)(ModalAttachContactPerson)

--------

**Modal component**

For custom modals, a component is created along the "/src/businessObjects/<BOLibName>/<BOName>/components/<componentName>" path to which all the props and actions that we transferred from stateToProps and dispatchToProps will be transferred

--------

| To invoke a modal window, an action is created in which createForm is called from forms.actions to create the form
| In createForm we pass: the name of the form, we can pass the default props and we can specify the allowRecreate flag

And then, to output the modal from modals.actions, showModal is called and pass there: whether to display the modal or not, the name of the modal and startProps

.. code-block:: javascript

  import { api, forms } from 'redux-restify'
  import modals from '$trood/modals'
  import {
    ATTACH_CONTACT_PERSON_FORM,
    ATTACH_CONTACT_PERSON_MODAL,
  } from './constants'

  export const attachContactPersonToEntity = (queryConfig, onSuccess = () => {}) => async (dispatch) => {
    const newForm = forms.createFormConfig({
      defaults: {
        contactPersons: [],
      },
    })
    dispatch(forms.actions.createForm(ATTACH_CONTACT_PERSON_FORM, newForm, true))

    const startProps = {
      queryConfig,
      onSuccess,
    }
    dispatch(modals.actions.showModal(true, ATTACH_CONTACT_PERSON_MODAL, startProps))
  }

********************************
Business objects library config
********************************

The BO library config file is ``src/businessObjects/<BOLibName>/config.js``

.. attribute:: title

    Business objects library name

.. attribute:: models

    Models are an array of objects that describe attributes for configuring a business object.

    .. attribute:: title

        Business object name

    .. attribute:: dependsOn

        an array of other business objects on which our described business object depends

    .. attribute:: services

        array of services with which our business object is associated

    .. attribute:: modal

        settings for modal window

        .. attribute:: size

            modal window size

    .. attribute:: viewModal

        settings for modal window

        .. attribute:: size

            modal window size
